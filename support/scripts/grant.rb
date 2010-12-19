#!/usr/bin/ruby

require 'rubygems'
require 'dbi'

if ARGV.length != 5 then
        program = File.basename($0)
        puts "Usage: #{program} database username password gazebouser maxsearchables"
        puts "Example: #{program} FB2010_05 dbuser xj2F3Mf gazebo 89"
        exit 1
end

database = ARGV[0]
username = ARGV[1]
password = ARGV[2]
gazebouser = ARGV[3]
maxsearchables = ARGV[4].to_i - 1

flybase = DBI.connect("DBI:Pg:#{database}:localhost", username, password)

for i in 0..maxsearchables
	flybase.execute("GRANT SELECT ON x_searchables_#{i} TO #{gazebouser}")
end

flybase.disconnect

