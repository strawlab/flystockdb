#!/usr/bin/ruby

require 'rubygems'
require 'dbi'

if ARGV.length != 3 then
        program = File.basename($0)
        puts "Usage: #{program} database username password"
        puts "Example: #{program} FB2010_05 dbuser xj2F3Mf"
	puts ""
	puts "On success, outputs:"
	puts "NOTICE:  CREATE TABLE will create implicit sequence \"x_stocks_id_seq\" for serial column \"x_stocks.id\""
	puts "NOTICE:  CREATE TABLE / PRIMARY KEY will create implicit index \"x_stocks_pkey\" for table \"x_stocks\""
	puts "NOTICE:  CREATE TABLE / UNIQUE will create implicit index \"x_stocks_limbo_key_key\" for table \"x_stocks\""
        exit 1
end

database = ARGV[0]
username = ARGV[1]
password = ARGV[2]

flybase = DBI.connect("DBI:Pg:#{database}:localhost", username, password)

for i in ['x_stocks'] do
	begin
		flybase.execute('DROP TABLE ' << i)
	rescue
	end
end

flybase.execute('CREATE TABLE x_stocks (id bigserial PRIMARY KEY, limbo_key varchar(128) UNIQUE, xref varchar(200), genotype text, label text, description text, donor varchar(1024), contact varchar(1024), wildtype varchar(1024), created_by varchar(40), created_on timestamp)')

flybase.execute('CREATE INDEX x_stocks__xref ON x_stocks (xref)')
flybase.execute('CREATE INDEX x_stocks__genotype ON x_stocks (genotype)')
flybase.execute('CREATE INDEX x_stocks__label ON x_stocks (label)')
flybase.execute('CREATE INDEX x_stocks__description ON x_stocks (description)')
flybase.execute('CREATE INDEX x_stocks__donor ON x_stocks (donor)')
flybase.execute('CREATE INDEX x_stocks__contact ON x_stocks (contact)')
flybase.execute('CREATE INDEX x_stocks__wildtype ON x_stocks (wildtype)')
flybase.execute('CREATE INDEX x_stocks__created_by ON x_stocks (created_by)')
flybase.execute('CREATE INDEX x_stocks__created_on ON x_stocks (created_on)')

flybase.disconnect

