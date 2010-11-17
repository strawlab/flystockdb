#!/usr/bin/ruby

require 'rubygems'
require 'dbi'
require 'date'

FEATURE_DEPTH = 3

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

searchables = []
frequencies = []
originals = []
for i in 0..max_length - 1 do
	searchables[i] = {}
	frequencies[i] = {}
	originals[i] = {}
end
transitions = []

# Stores synonyms that I have removed, i.e. which do not become searchables.
bad = []

loci = []
kind_by_popularity = {}
kind_by_name = {}

name_by_synonym = {}
flybase_id_by_synonym = {}
flybase_id_by_feature = {}

puts DateTime.now       
puts 'Determining kind of all features (without considering synonyms)..'
                        
part = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
	's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
	'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

part.each { |prefix|
	kinds = flybase.execute('SELECT DISTINCT f.name, c.name FROM feature f, cvterm c WHERE f.type_id = c.cvterm_id AND f.name LIKE \'' << prefix << '%\'')
                        
	kinds.fetch do |row|    
        	feature, kind = row
                
        	feature.chomp!
        	kind.chomp!
                        
       		kind_by_name[feature] = kind
	end
}

puts DateTime.now
puts 'Determining FlyBase IDs by feature and synonym name..'

part.each { |prefix|
	ids = flybase.execute('SELECT DISTINCT s.name, f.name, f.uniquename FROM feature f, synonym s, cvterm c, feature_synonym fs ' <<
		'WHERE s.type_id = c.cvterm_id AND (c.name = \'symbol\' OR c.name = \'nickname\' OR c.name = \'fullname\') AND ' <<
		's.name LIKE \'' << prefix << '%\' AND s.synonym_id = fs.synonym_id AND f.feature_id = fs.feature_id AND ' <<
		'f.organism_id = 1 AND f.uniquename LIKE \'FB%\'')

	ids.fetch do |row|
		synonym, name, uniquename = row

		synonym.chomp!
		name.chomp!
		uniquename.chomp!

		name_by_synonym[name] = synonym
		flybase_id_by_synonym[synonym] = uniquename
	end

	ids = flybase.execute('SELECT DISTINCT f.name, f.uniquename FROM feature f ' <<
		'WHERE f.name LIKE \'' << prefix << '%\' AND f.organism_id = 1 AND f.uniquename LIKE \'FB%\'')

	ids.fetch do |row|
		name, uniquename = row

		name.chomp!
		uniquename.chomp!

		flybase_id_by_feature[name] = uniquename
	end
}

puts DateTime.now
puts 'Fetching locations..'

locations = flybase.execute('SELECT DISTINCT s.name FROM ' <<
                               	'synonym s, cvterm c WHERE ' <<
#					'(s.name = \'h\' OR s.name = \'CyO\' OR s.name = \'CyO23\' OR s.name = \'Df(2)chic[221]\') AND ' <<
                                       	's.type_id = c.cvterm_id AND ' <<
                                       	'(c.name = \'symbol\' OR c.name = \'fullname\' OR c.name = \'nickname\')')

for i in 0..FEATURE_DEPTH do
	loci[i] = {}
end

locations.fetch do |row|
	synonym = row[0]

	synonym.chomp!

	synonyms = [synonym]
	for i in 0..FEATURE_DEPTH do
		next_synonyms = []
		synonyms.each { |ref|
			# For the next round..
			#puts '' << synonym << ': ' << i.to_s << ' : ' << ref
			references_st = flybase.prepare('SELECT DISTINCT f.name FROM ' <<
							'synonym s, cvterm c, feature_synonym fs, feature_relationship fr, feature f, ' <<
							'cvterm cr WHERE ' <<
							's.name = ? AND ' <<
							's.type_id = c.cvterm_id AND ' <<
							'(c.name = \'symbol\' OR c.name = \'fullname\' OR c.name = \'nickname\') AND ' <<
							's.synonym_id = fs.synonym_id AND ' <<
							'fr.subject_id = fs.feature_id AND ' <<
							'(cr.name = \'alleleof\' OR cr.name = \'progenitor\') AND ' <<
							'fr.type_id = cr.cvterm_id AND ' <<
							'f.feature_id = fr.object_id')
			references_st.execute(ref)
			references_st.fetch do |ref_row|
				next_synonym = ref_row[0]
				
				next if next_synonym == nil

				next_synonym.chomp!
				next_synonyms |= [next_synonym]
			end
			references_st.finish
			ref_locations_st = flybase.prepare('SELECT DISTINCT s.name, chr.name, chr.uniquename FROM ' <<
			                                'synonym s, cvterm c, feature_synonym fs, featureloc fl, feature chr, cvterm chr_term WHERE ' <<
							's.name = ? AND ' <<
                        		                's.type_id = c.cvterm_id AND ' <<
                                        		'(c.name = \'symbol\' OR c.name = \'fullname\' OR c.name = \'nickname\') AND ' <<
                                        		's.synonym_id = fs.synonym_id AND ' <<
                                        		'fs.feature_id = fl.feature_id AND ' <<
                                        		'fl.srcfeature_id = chr.feature_id AND ' <<
                                        		'chr.type_id = chr_term.cvterm_id AND ' <<
                                        		'chr_term.name = \'chromosome_arm\'')
			ref_locations_st.execute(ref)
			ref_locations_st.fetch do |loc_row|
				loc_synonym, chromosome, arm = loc_row

				synonym.chomp!
				chromosome.chomp!
				arm.chomp!

				loci[i][synonym] = [chromosome, arm]
			end
			ref_locations_st.finish
		}
		synonyms = next_synonyms.dup
	end
end

#searchables = ['h','CyO','CyO23','Df(2)chic[221]']
#searchables.each { |searchable|
#for j in 0..FEATURE_DEPTH do
#	if loci[j].has_key?(searchable) then
#		chromosome, arm = loci[j][searchable]
#		puts '' << searchable << ' ' << chromosome << ' ' << arm
#		break
#	end
#end
#}

puts DateTime.now
puts 'Fetching synonyms..'

part.each { |synonym_prefix|
puts 'Prefix.. ' << synonym_prefix
#synonyms = flybase.execute('SELECT DISTINCT s.name, cf.name, COUNT(DISTINCT fp.pub_id) as frequency FROM ' <<
#				'synonym s, cvterm c, feature_synonym fs, feature_pub fp, feature f, cvterm cf WHERE ' << 
#					's.type_id = c.cvterm_id AND ' <<
#				  	'(c.name = \'symbol\' OR c.name = \'fullname\' OR c.name = \'nickname\') AND ' <<
#				  	's.synonym_id = fs.synonym_id AND ' <<
#				  	'fs.feature_id = fp.feature_id AND ' <<
#					'fs.feature_id = f.feature_id AND ' <<
#					'f.type_id = cf.cvterm_id ' <<
#			  	'GROUP BY s.name ' <<
#			  	'ORDER BY frequency DESC')
synonyms = flybase.execute('SELECT intersection.synonym_name, intersection.name, intersection.frequency FROM ' <<
		'(SELECT x.synonym_name, x.name, x.frequency, MAX(y.frequency) FROM ' <<
		'(SELECT DISTINCT ' <<
			's.name AS synonym_name, cf.name, COUNT(DISTINCT fp.pub_id) AS frequency ' <<
		'FROM ' <<
			'synonym s, cvterm c, feature_synonym fs, feature_pub fp, feature f, cvterm cf ' <<
		'WHERE ' <<
			's.type_id = c.cvterm_id AND ' <<
			'(c.name = \'symbol\' OR c.name = \'fullname\' OR c.name = \'nickname\') AND ' <<
			's.synonym_id = fs.synonym_id AND ' <<
			's.name LIKE \'' << synonym_prefix << '%\' AND ' <<
			'fs.feature_id = fp.feature_id AND ' <<
			'fs.feature_id = f.feature_id AND ' <<
			'cf.cvterm_id = f.type_id AND ' <<
			'(cf.name = \'gene\' OR cf.name = \'single balancer\' OR cf.name = \'chromosome_structure_variation\' OR cf.name = \'transgenic_transposon\' OR cf.name = \'transposable_element_insertion_site\') ' <<
		'GROUP BY s.name, cf.name ' <<
		'ORDER BY frequency DESC) AS x, ' <<
		'(SELECT DISTINCT ' <<
			's.name AS synonym_name, cf.name, COUNT(DISTINCT fp.pub_id) AS frequency ' <<
		'FROM ' <<
			'synonym s, cvterm c, feature_synonym fs, feature_pub fp, feature f, cvterm cf ' <<
		'WHERE ' <<
			's.type_id = c.cvterm_id AND ' <<
			'(c.name = \'symbol\' OR c.name = \'fullname\' OR c.name = \'nickname\') AND ' <<
			's.synonym_id = fs.synonym_id AND ' <<
			's.name LIKE \'' << synonym_prefix << '%\' AND ' <<
			'fs.feature_id = fp.feature_id AND ' <<
			'fs.feature_id = f.feature_id AND ' <<
			'cf.cvterm_id = f.type_id AND ' <<
			'(cf.name = \'gene\' OR cf.name = \'single balancer\' OR cf.name = \'chromosome_structure_variation\' OR cf.name = \'transgenic_transposon\' OR cf.name = \'transposable_element_insertion_site\') ' <<
		'GROUP BY s.name, cf.name ' <<
		'ORDER BY frequency DESC) AS y ' <<
		'WHERE ' <<
			'x.synonym_name = y.synonym_name ' <<
		'GROUP BY x.synonym_name, x.name, x.frequency) AS intersection ' <<
			'WHERE intersection.frequency = intersection.max')
#synonyms = flybase.execute('SELECT DISTINCT s.name, COUNT(DISTINCT fp.pub_id) as frequency FROM ' <<
#                              'synonym s, cvterm c, feature_synonym fs, feature_pub fp WHERE ' << 
#                              's.type_id = c.cvterm_id AND ' <<
#                              '(c.name = \'symbol\' OR c.name = \'nickname\') AND ' <<
#                              's.synonym_id = fs.synonym_id AND ' <<
#                              'fs.feature_id = fp.feature_id ' <<
#                              'GROUP BY s.name LIMIT 5')

synonyms.fetch do |row|
	synonym = row[0]
	synonym.chomp!

	cvterm = row[1]
	cvterm.chomp!

	frequency = row[2].to_i

	if synonym.split(' ').length > 1 then
		bad.push(synonym.clone)
		puts 'Bad: ' << synonym
		next
	end

	original = synonym.clone

	kind_by_popularity[original] = cvterm

	index = synonym.length - 1
	while index >= 0 do
		prefix = synonym.dup[0, index]
		postfix = synonym.dup[index, synonym.length]

		postfix.sub!(/^\.\w+/, '. ...')
		postfix.sub!(/^,\w+/, ', ...')
		postfix.sub!(/^:\w+/, ': ...')

		postfix.sub!(/^\{[^\{\(\[\}\)\]]+\}/, '{...}')
		postfix.sub!(/^\([^\{\(\[\}\)\]]+\)/, '(...)')
		postfix.sub!(/^\[[^\{\(\[\}\)\]]+\]/, '[...]')

		postfix.sub!(/^\}\w+/, '}...')
       		postfix.sub!(/^\)\w+/, ')...')
       		postfix.sub!(/^\]\w+/, ']...')

		#postfix.gsub!(/ .+/, '...')
		postfix.sub!(/^\/\w+/, '/...')
		postfix.sub!(/^\\\w+/, '\...')
		postfix.sub!(/^-\w+/, '-...')
		postfix.sub!(/^\+\w+/, '+...')
		postfix.sub!(/^#\w+/, '#...')

		# Squeeze the rest out of it!
		if not (prefix.include?('{') or
			prefix.include?('(') or
			prefix.include?('[')) then
			#postfix.sub!(/\d+\{/, '...{')
			#postfix.sub!(/\d+\(/, '...(')
			#postfix.sub!(/\d+\[/, '...[')

			#postfix.sub!(/\d+\w\d+\{/, '...{')
                        #postfix.sub!(/\d+\w\d+\(/, '...(')
                        #postfix.sub!(/\d+\w\d+\[/, '...[')

			postfix.gsub!(/\{[^\}]+\}/, '{...}')
			postfix.gsub!(/\([^\)]+\)/, '(...)')
			postfix.gsub!(/\[[^\]]+\]/, '[...]')

			#postfix.sub!(/\d+\w\d+$/, '...')
			#postfix.sub!(/\d+$/, '...')
		end

		if postfix != synonym[index, synonym.length] then
			synonym_new = synonym[0, index] << postfix
			transitions.push([synonym_new,  synonym.clone])
			# puts 'T: ' << synonym_new << ' -> ' << synonym
			synonym = synonym_new.dup
		end
		
		#index = index - 1

		originals[index][synonym] = original

		if searchables[index][synonym] then
			searchables[index][synonym] = searchables[index][synonym] + 1
			frequencies[index][synonym] = frequency unless  frequencies[index][synonym] >= frequency
		else
			searchables[index][synonym] = 1
			frequencies[index][synonym] = frequency
		end

		index = index - 1
	end

	#originals[index][synonym] = original
	# puts 'O: ' << synonym << ' -> ' << original

	#if searchables[index][synonym] then
	#	searchables[index][synonym] = searchables[index][synonym] + 1
	#	frequencies[synonym] = frequency unless  frequencies[synonym] >= frequency
	#else
	#	searchables[index][synonym] = 1
	#	frequencies[synonym] = frequency
	#end
end
}

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

puts 'Sort searchables by frequency...'
searchables_by_frequency = []
for i in 0..max_length - 1 do
	searchables_by_frequency[i] = frequencies[i].sort { |a, b| b[1] <=> a[1] }.map { |searchable, frequency| searchable }
end

for i in 0..max_length - 1 do
	flybase.execute('CREATE TABLE x_searchables_' << i.to_s << ' (searchable VARCHAR(200) PRIMARY KEY, occurrences INTEGER, kind VARCHAR(200), chromosome VARCHAR(10), chromosome_arm VARCHAR(10), uniquename VARCHAR(200), name VARCHAR(200))')
end
flybase.execute('CREATE TABLE x_transitions (abstraction VARCHAR(200), concretisation VARCHAR(200), occurrences INTEGER)')
flybase.execute('CREATE TABLE x_non_searchables (non_searchable VARCHAR(200))')

puts DateTime.now
query = ''
key = ''
for i in 0..max_length - 1 do
	puts 'Searchables[' << i.to_s << ']: ' << searchables[i].length.to_s
	begin
		searchables_by_frequency[i].each { |searchable|
			occurrences = searchables[i][searchable]
			query = 'Searchables: ' << searchable << ' Occurrences: ' << occurrences.to_s
			if occurrences == 1 then
				searchable = originals[i][searchable]
			end
			key = searchable
			chromosome = ''
			arm = ''
			for j in 0..FEATURE_DEPTH do
				if loci[j].has_key?(searchable) then
					chromosome, arm = loci[j][searchable]
					break
				end
			end
			searchable_kind = ''
			if kind_by_name.has_key?(searchable) then
				searchable_kind = kind_by_name[searchable]
			elsif kind_by_popularity.has_key?(searchable) then
				searchable_kind = kind_by_popularity[searchable]
			end
			uniquename = ''
			name = ''
			if flybase_id_by_feature.has_key?(searchable) then
				uniquename = flybase_id_by_feature[searchable]
				name = searchable
			elsif flybase_id_by_synonym.has_key?(searchable) then
				uniquename = flybase_id_by_synonym[searchable]
				name = name_by_synonym[searchable] if name_by_synonym.has_key?(searchable)
			end
			sql_insert = flybase.prepare('INSERT INTO x_searchables_' << i.to_s << ' VALUES (?, ?, ?, ?, ?, ?, ?)')
			sql_insert.execute(searchable, occurrences, searchable_kind, chromosome, arm, uniquename, name)
			sql_insert.finish
		}
	rescue RuntimeError => e
		puts 'Woops..'
		puts e
		puts query
		puts 'Searchable: ' << key
	end
end

puts DateTime.now
puts 'Transitions: ' << transitions.length.to_s
transitions.uniq!
puts 'Unique transitions: ' << transitions.length.to_s
begin
	# 'occurrences' denotes how many times we see an item as abstraction.
	occurrences = 0
	transitions.each { |transition|
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
	}
rescue RuntimeError => e
	puts 'Woops..'
	puts e
	puts query
end

flybase.execute('CREATE INDEX x_transitions__abstraction ON x_transitions (abstraction)')

puts DateTime.now
puts 'Non-searchables: ' << bad.length.to_s
bad.each do |name|
	sql_insert = flybase.prepare('INSERT INTO x_non_searchables VALUES (?)')
	sql_insert.execute(name)
	sql_insert.finish
end

flybase.disconnect

puts DateTime.now
puts 'Done.'

