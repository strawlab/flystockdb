#   Copyright and License: see LICENSE file
#
#   Contributors:
#	   * Joachim Baran

task :default => :build_client do
  # Default rule for us slackers who cannot be bothered to say
  # what we really want. Meh.
end

task :gem do
  # Provided because NetBeans would otherwise complain about a
  # missing "gem" task.
end

task :build_client do
  puts 'Building Qooxdoo-client.. this may take a while..'
  puts `python generate.py build`
end

task :clean do
  puts `python generate.py clean`
end
