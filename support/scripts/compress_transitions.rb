#!/usr/bin/ruby

require 'rubygems'
require 'dbi'
require 'date'

if ARGV.length != 3 then
	program = File.basename($0)
        puts "Usage: #{program} database username password"
        puts "Example: #{program} FB2010_05 dbuser xj*2F£3Mf"
        exit 1
end

database = ARGV[0]
username = ARGV[1]
password = ARGV[2]

map = {}

def refine_synonym(map, synonym)
	destination = map[synonym]

	# Synonym is not an abstraction, i.e. contains no '...'.
	if destination == nil then
		return synonym
	end

	# Synonym has several children, i.e. the '...' is justified.
	if destination.length > 1 then
		return synonym
	end

	return refine_synonym(map, destination[0][0])
end

flybase = DBI.connect("DBI:Pg:#{database}:localhost", username, password)

puts DateTime.now
puts 'Fetching transitions..'

transitions = flybase.execute('SELECT abstraction, concretisation, occurrences FROM x_transitions')
transitions.fetch do |row|
	abstraction, concretisation, occurrences = row

	if map.has_key?(abstraction) then
		map[abstraction].push([concretisation, occurrences])
	else
		map[abstraction] = [[concretisation, occurrences]]
	end
end

begin
	flybase.execute('DROP TABLE x_fast_transitions')
	puts 'Dropped x_fast_transitions...'
rescue RuntimeError
end

flybase.execute('CREATE TABLE x_fast_transitions (abstraction VARCHAR(200), concretisation VARCHAR(200), occurrences INT, kind VARCHAR(200), chromosome VARCHAR(200), chromosome_arm VARCHAR(200))')

puts DateTime.now
puts 'Transition origins: ' << map.length.to_s
begin
	map.each { |transition|
		abstraction, concretisations = transition

		concretisations.each { |concretisation|
			synonym, occurrences = concretisation

			refined_synonym = refine_synonym(map, synonym)
			annotation = ['', 0, '', '', '']

			#puts '-> ' << abstraction << ' -> ' << synonym << ' ~ ' << refined_synonym

			if !(refined_synonym =~ /.../) then
				annotations = flybase.prepare('SELECT * FROM x_searchables_' <<
					(refined_synonym.length - 1).to_s <<
					' WHERE searchable=?')
				annotations.execute(refined_synonym)
				annotations.fetch { |row|
					annotation = row
				}
				annotations.finish
			end

			sql_insert = flybase.prepare('INSERT INTO x_fast_transitions VALUES (?, ?, ?, ?, ?, ?)')
			
			sql_insert.execute(abstraction, refined_synonym, annotation[1], annotation[2], annotation[3], annotation[4])
			sql_insert.finish
		}
	}
rescue RuntimeError => e
	puts 'Woops..'
	puts e
	puts query
end

flybase.execute('CREATE INDEX x_fast_transitions__abstraction ON x_fast_transitions (abstraction)')

puts DateTime.now
puts 'Done.'

