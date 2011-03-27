#!/usr/bin/ruby

require 'rubygems'
require 'dbi'
require 'date'

FEATURE_DEPTH = 0

@total_searchables = 0
@direct_locations = 0
@known_locations = 0

def extract_location(string)
	chromosome = ''
	arm = ''

	if string.match(/^(In|Df)\(\d[LR]{0,2}\).*/) then
		chromosome, arm = string.scan(/^\w+\((\d)([LR]{0,2})\).*/)[0]
	end

	if string.match(/^(D|T)\w?\(\d;\d\).*/) then
		chromosome = string.scan(/^\w+\(\d;(\d)\).*/)[0][0]
	end

	chromosome = 'X' if chromosome == 1

	return [ chromosome, arm ]
end

def query_relationship(flybase, cvterm_name, searchable)
	chromosome = ''
	arm = ''
	flybase_id = ''

        sql_parent = flybase.prepare('SELECT obj.name, sub.uniquename FROM ' <<
                                      'cvterm c, feature sub, feature obj, feature_relationship fr WHERE ' <<
                                      'c.name = \'' << cvterm_name << '\' AND ' <<
                                      'sub.name = ? AND ' <<
                                      'fr.subject_id = sub.feature_id AND ' <<
                                      'fr.type_id = c.cvterm_id AND ' <<
                                      'obj.feature_id = fr.object_id'
        )
        sql_parent.execute(searchable)
        sql_parent.fetch { |row|
                name, flybase_id = row

                chromosome, arm = extract_location(name)
        }
        sql_parent.finish

	return [ chromosome, arm, flybase_id ]
end

def get_immediate_location(flybase, searchable, loci, occurrences)
	chromosome = ''
	arm = ''
	uniquename = ''

	for j in 0..FEATURE_DEPTH do
		if loci[j].has_key?(searchable) then
			chromosome, arm = loci[j][searchable]
			direct_hit = true if occurrences == 1 and j == 0 and chromosome != ''
			break
		end
	end
	if chromosome == '' then
		chromosome, arm = extract_location(searchable)
		direct_hit = true if occurrences == 1 and chromosome != ''
	end
	if chromosome == '' then
		chromosome, arm, uniquename = query_relationship(flybase, 'variant_of', searchable)
		chromosome, arm, uniquename = query_relationship(flybase, 'chromosome_structure_variation', searchable) if chromosome == ''             
		direct_hit = true if occurrences == 1 and chromosome != ''
	end

	return [chromosome, arm, uniquename, direct_hit]
end

def insert_searchable(flybase, searchable, i)
	query = ''
	key = ''
	begin
		occurrences = @searchables[i][searchable]
		query = 'Searchables: ' << searchable << ' Occurrences: ' << occurrences.to_s
		if occurrences == 1 then
			searchable = @originals[searchable]
		end
		key = searchable
		chromosome = ''
		arm = ''
		uniquename = ''
		name = ''
		direct_hit = false
		chromosome, arm, uniquename, direct_hit = get_immediate_location(flybase, searchable, @loci, occurrences)
		if uniquename == '' and @flybase_id_by_synonym.has_key?(searchable) then
			uniquename = @flybase_id_by_synonym[searchable]
			name = @name_by_synonym[searchable] if @name_by_synonym.has_key?(searchable)
		end

		flybase_id = @flybase_id_by_synonym[searchable]
		searchable_kind = @kind_by_flybase_id[flybase_id]
		searchable_kind = '' unless searchable_kind

		if chromosome == '' then
			ref_chromosome, ref_arm, ref_uniquename, ref_direct_hit = get_immediate_location(flybase, name, @loci, occurrences)

			chromosome = ref_chromosome unless ref_chromosome == ''
			arm = ref_arm unless ref_arm == ''
		end
		sql_insert = flybase.prepare('INSERT INTO x_searchables_' << i.to_s << ' VALUES (?, ?, ?, ?, ?, ?, ?)')
		sql_insert.execute(searchable, occurrences, searchable_kind, chromosome, arm, uniquename, name)
		sql_insert.finish
		flybase.commit

		#puts ' --> ' << searchable << ': ' << chromosome << ' - ' << uniquename

		@total_searchables += 1 if occurrences == 1
		@direct_locations += 1 if direct_hit
		@known_locations += 1 if occurrences == 1 and chromosome != ''
	rescue RuntimeError => e
		puts 'Woops..'
		puts e
		puts query
		puts 'Searchable: ' << key
	end
end

if ARGV.length != 3 then
        program = File.basename($0)
        puts "Usage: #{program} database username password"
        puts "Example: #{program} FB2010_05 dbuser xj2F3Mf"
        exit 1
end

database = ARGV[0]
username = ARGV[1]
password = ARGV[2]

flybase = DBI.connect("DBI:Pg:#{database}:localhost", username, password)

# Get the length of the longest synonym that does not contain spaces.
# We delete synonyms that contain spaces.
puts DateTime.now
puts 'Determining longest (usable) synonym name..'
length_result = flybase.execute('SELECT LENGTH(s.name) AS length FROM synonym s WHERE s.name NOT LIKE \'% %\' ORDER BY length DESC LIMIT 1')
max_length = length_result.fetch[0]
puts 'Max. length: ' << max_length.to_s

# Stores synonyms that I have removed, i.e. which do not become searchables.
@bad = []

@loci = []

@name_by_synonym = {}
@flybase_id_by_synonym = {}

part = ('a'..'z').to_a | ('A'..'Z').to_a | ('0'..'9').to_a

puts DateTime.now
puts 'Determining FlyBase IDs by feature and synonym name..'

@seen_synonyms = {}
@seen_features = {}
@whoa_a_balancer = {}
@pubs_by_synonym = {}

part.each { |prefix|
	ids = flybase.execute('SELECT DISTINCT s.name, f.name, f.uniquename, COUNT(DISTINCT fp.pub_id) FROM feature f, synonym s, cvterm c, feature_synonym fs, feature_pub fp ' <<
		'WHERE s.type_id = c.cvterm_id AND (c.name = \'symbol\' OR c.name = \'nickname\' OR c.name = \'fullname\') AND ' <<
		's.name LIKE \'' << prefix << '%\' AND s.synonym_id = fs.synonym_id AND f.feature_id = fs.feature_id AND ' <<
		'f.feature_id = fp.feature_id AND ' <<
		'f.organism_id = 1 AND f.uniquename LIKE \'FB%\' ' <<
		'GROUP BY s.name, f.name, f.uniquename')

	ids.fetch do |row|
		synonym, name, uniquename, pubs = row

		# Might be faster to sort out entries here than having two more regexp
		# in the SQL query. No performance profiling done though.
		next if name.match(' ')
		next if synonym.match(' ')

		if @seen_synonyms[synonym] then
			unless @whoa_a_balancer[synonym] then
				if synonym.match(/^FBba\d+/) then
					@whoa_a_balancer[synonym] = true
					@name_by_synonym[synonym] = name
					@flybase_id_by_synonym[synonym] = uniquename
					@pubs_by_synonym[synonym] = 2147483648 # 2^31
				else
					if synonym == name then
						@name_by_synonym[synonym] = name
						@flybase_id_by_synonym[synonym] = uniquename
						@pubs_by_synonym[synonym] = 2147483648 # 2^31
					else
						if @pubs_by_synonym[synonym] and @pubs_by_synonym[synonym] == pubs then
							@name_by_synonym.delete(synonym)
							@flybase_id_by_synonym.delete(synonym)
						end
						if @pubs_by_synonym[synonym] and @pubs_by_synonym[synonym] < pubs then
							@name_by_synonym[synonym] = name
							@flybase_id_by_synonym[synonym] = uniquename
							@pubs_by_synonym[synonym] = pubs.to_i
						end
					end
				end
			end
		else
			@name_by_synonym[synonym] = name
			@flybase_id_by_synonym[synonym] = uniquename
			@pubs_by_synonym[synonym] = pubs.to_i
			@seen_synonyms[synonym] = true
		end
	end
}

GC.start

puts DateTime.now
puts 'Fetching locations..'

for i in 0..FEATURE_DEPTH do
	@loci[i] = {}
end

@seen_synonyms.keys.each { |synonym|
	found_location = false

	next unless @flybase_id_by_synonym[synonym]

	# TODO Hack: cvterm 'chromosome_arm' has the type_id 210
	query_string = 'SELECT f.name, chr.name, chr.uniquename, f.uniquename FROM ' <<
		'feature f, featureloc fl, feature chr WHERE '
	query_string << 'f.uniquename = ? AND '
	query_string << 'fl.feature_id = f.feature_id AND ' <<
		'fl.srcfeature_id = chr.feature_id AND ' <<
		'chr.type_id = 210 ' <<
		#'chr_term.name = \'chromosome_arm\' ' <<
		'LIMIT 1'
	location_s = flybase.prepare(query_string)
	location_s.execute(@flybase_id_by_synonym[synonym])
	location_s.fetch do |row|
		name, chromosome, arm, flybase_id = row

		found_location = true if chromosome != ''

		@loci[0][synonym] = [chromosome, arm]
	end
	location_s.finish

	next if found_location

	ids = [ @flybase_id_by_synonym[synonym] ]
	for i in 0..FEATURE_DEPTH do
		next_ids = []
		ids.each { |ref|
			references_st = flybase.prepare('SELECT DISTINCT f.uniquename FROM ' <<
							'feature_relationship fr, feature f, ' <<
							'feature fs, cvterm cr WHERE ' <<
							'fs.uniquename = ? AND ' <<
							'fr.subject_id = fs.feature_id AND ' <<
							'(cr.name = \'alleleof\' OR cr.name = \'progenitor\') AND ' <<
							'fr.type_id = cr.cvterm_id AND ' <<
							'f.feature_id = fr.object_id')
			references_st.execute(ref)
			references_st.fetch do |ref_row|
				next_id = ref_row[0]

				next_ids |= [next_id]
			end
			references_st.finish
			ref_locations_st = flybase.prepare('SELECT DISTINCT chr.name, chr.uniquename FROM ' <<
			                                'featureloc fl, feature f, feature chr, cvterm chr_term WHERE ' <<
							'f.uniquename = ? AND ' <<
                                        		'f.feature_id = fl.feature_id AND ' <<
                                        		'fl.srcfeature_id = chr.feature_id AND ' <<
                                        		'chr.type_id = chr_term.cvterm_id AND ' <<
                                        		'chr_term.name = \'chromosome_arm\'')
			ref_locations_st.execute(ref)
			ref_locations_st.fetch do |loc_row|
				chromosome, arm = loc_row

				next if seen_synonyms[synonym]

                                chromosome, arm = extract_location(synonym) if chromosome == ''
				@loci[i][synonym] = [chromosome, arm]
			end
			ref_locations_st.finish
		}
		ids = next_ids
	end
}

GC.start

for i in 0..max_length - 1 do
        begin
                flybase.execute('DROP TABLE x_searchables_' << i.to_s)
                puts 'Dropped x_searchables_' << i.to_s << '...'
        rescue RuntimeError
        end
end

begin
        flybase.execute('DROP TABLE x_transitions')
        puts 'Dropped x_transitions...'
rescue RuntimeError
end

begin
        flybase.execute('DROP TABLE x_non_searchables')
        puts 'Dropped x_non_searchables...'
rescue RuntimeError
end

for i in 0..max_length - 1 do
        flybase.execute('CREATE TABLE x_searchables_' << i.to_s << ' (searchable VARCHAR(200) PRIMARY KEY, occurrences INTEGER, kind VARCHAR(200), chromosome VARCHAR(10), chromosome_arm VARCHAR(10), uniquename VARCHAR(200), name VARCHAR(200))')
end
flybase.execute('CREATE TABLE x_transitions (abstraction VARCHAR(200), concretisation VARCHAR(200), occurrences INTEGER)')
flybase.execute('CREATE TABLE x_non_searchables (non_searchable VARCHAR(200))')

puts DateTime.now
puts 'Determining feature type by FlyBase ID...'

@kind_by_flybase_id = {}
@seen_synonyms.keys.each { |synonym|
	cvterm = 'unknown'

	flybase_id = @flybase_id_by_synonym[synonym]
	if flybase_id then
		cvterm = 'gene' if flybase_id.start_with?('FBgn')
		cvterm = 'allele' if flybase_id.start_with?('FBal')
		cvterm = 'balancer' if flybase_id.start_with?('FBba')
	end

	@kind_by_flybase_id[flybase_id] = cvterm
}

@searchables = []
@frequencies = []
@originals = {}

@transitions = []

part.each { |partition|
	@searchables = []
	@frequencies = []
	@originals = {}
	for i in 0..max_length - 1 do
		@searchables[i] = {}
		@frequencies[i] = {}
	end

	GC.start

	@seen_synonyms.keys.each { |synonym|
		next unless synonym.start_with?(partition)

		frequency = @pubs_by_synonym[synonym]
		frequency = 0 unless frequency

		if synonym.split(' ').length > 1 then
			@bad.push(synonym.clone)
			puts 'Bad: ' << synonym
			next
		end

		original = synonym

		index = synonym.length - 1
		while index >= 0 do
			prefix = synonym[0, index]
			postfix = synonym[index, synonym.length]

			postfix.sub!(/^\.\w+/, '. ...')
			postfix.sub!(/^,\w+/, ', ...')
			postfix.sub!(/^:\w+/, ': ...')

			postfix.sub!(/^\{[^\{\(\[\}\)\]]+\}/, '{...}')
			postfix.sub!(/^\([^\{\(\[\}\)\]]+\)/, '(...)')
			postfix.sub!(/^\[[^\{\(\[\}\)\]]+\]/, '[...]')

			postfix.sub!(/^\}\w+/, '}...')
       			postfix.sub!(/^\)\w+/, ')...')
       			postfix.sub!(/^\]\w+/, ']...')

			postfix.sub!(/^\/\w+/, '/...')
			postfix.sub!(/^\\\w+/, '\...')
			postfix.sub!(/^-\w+/, '-...')
			postfix.sub!(/^\+\w+/, '+...')
			postfix.sub!(/^#\w+/, '#...')

			# Squeeze the rest out of it!
			if not (prefix.include?('{') or
				prefix.include?('(') or
				prefix.include?('[')) then

				postfix.gsub!(/\{[^\}]+\}/, '{...}')
				postfix.gsub!(/\([^\)]+\)/, '(...)')
				postfix.gsub!(/\[[^\]]+\]/, '[...]')

			end

			if postfix != synonym[index, synonym.length] then
				synonym_new = synonym[0, index] << postfix
				@transitions.push([synonym_new,  synonym])
				synonym = synonym_new
			end
		
			@originals[synonym] = original

			if @searchables[index][synonym] then
				@searchables[index][synonym] = @searchables[index][synonym] + 1
				@frequencies[index][synonym] = frequency unless @frequencies[index][synonym] >= frequency
			else
				@searchables[index][synonym] = 1
				@frequencies[index][synonym] = frequency
			end

			index = index - 1
		end
	}

	puts 'Sort searchables by frequency...'
	@searchables_by_frequency = []
	for i in 0..max_length - 1 do
		@searchables_by_frequency[i] = @frequencies[i].sort { |a, b| b[1] <=> a[1] }.map { |searchable, frequency| searchable }
	end

	puts DateTime.now
	puts 'Inserting searchables... for partition ' << partition
	query = ''
	key = ''
	for i in 0..max_length - 1 do
		puts 'Searchables[' << i.to_s << ']: ' << @searchables[i].length.to_s

		@searchables_by_frequency[i].each { |searchable|
			#puts 'INSERT ' << searchable << ' ORI: ' << @originals[searchable] << ' CNT: ' << @searchables[i][searchable].to_s << ' i: ' << i.to_s
			searchable = @originals[searchable] if @searchables[i][searchable] == 1
			insert_searchable(flybase, searchable, i)
		}
	end
}

puts DateTime.now
puts 'Transitions: ' << @transitions.length.to_s
@transitions.uniq!
puts 'Unique transitions: ' << @transitions.length.to_s
begin
	# 'occurrences' denotes how many times we see an item as abstraction.
	occurrences = 0
	@transitions.each { |transition|
		abstraction, concretisation = transition
		query = 'Abstraction: ' << abstraction << ' Concretisation: ' << concretisation
#		if concretisation.include?('...') then
#			occurrences = transitions.map { |x| if x[0] == concretisation then x[0] else nil end  }.nitems
#		else
#			occurrences = 0
#		end
		sql_insert = flybase.prepare('INSERT INTO x_transitions VALUES (?, ?, ?)')
		sql_insert.execute(abstraction, concretisation, occurrences)
		sql_insert.finish
		flybase.commit
	}
rescue RuntimeError => e
	puts 'Woops..'
	puts e
	puts query
end

flybase.execute('CREATE INDEX x_transitions__abstraction ON x_transitions (abstraction)')

puts DateTime.now
puts 'Non-searchables: ' << @bad.length.to_s
@bad.each do |name|
	sql_insert = flybase.prepare('INSERT INTO x_non_searchables VALUES (?)')
	sql_insert.execute(name)
	sql_insert.finish
	flybase.commit
end

flybase.disconnect

puts 'Direct locations:  ' << @direct_locations.to_s
puts 'Known locations:   ' << @known_locations.to_s
puts 'Total searchables: ' << @total_searchables.to_s

puts DateTime.now
puts 'Done.'

