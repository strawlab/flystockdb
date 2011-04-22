<span style="color: #0099cc;">fly</span><span style="color: #009966;">stock</span><span style="color: #333333;">db</span>
==========

[<span style="color: #0099cc;">fly</span><span style="color: #009966;">stock</span><span style="color: #333333;">db</span>](http://www.flystockdb.org) is a free web-database for keeping Drosophila melanogaster stocks. A short screencast-preview about the project can be found here: [Preview of the Dmel-stock-keeping database "<span style="color: #0099cc;">fly</span><span style="color: #009966;">stock</span><span style="color: #333333;">db</span>"](http://bergmanlab.smith.man.ac.uk/?p=704). Occasionally I [blog](http://joachimbaran.wordpress.com/tag/flystockdb/) about <span style="color: #0099cc;">fly</span><span style="color: #009966;">stock</span><span style="color: #333333;">db</span> news and developments.

Documentation
-------------

Documentation is been prepared and can be found on-line as a [wiki](https://github.com/joejimbo/flystockdb/wiki), or it can be downloaded in markdown format:

    git clone git://github.com/joejimbo/flystockdb.wiki.git

Quick Installation Guide
------------------------

PostgreSQL needs to be installed and running; FlyBase needs to be loaded as a database, where I assume that the database is named FBYYYY_MM in the following. As in the instructions given by FlyBase, YYYY and MM will correspond to the year and month of the FlyBase release. For example, your database might be called FB2010_09. There needs to be a PostgreSQL user 'gazebo' with password 'gazebo' set-up, who has the permission to create databases.

Get the web-application framework Gazebo and the flystockdb implementation from GitHub:

    git clone git://github.com/joejimbo/Gazebo.git
    git clone git://github.com/joejimbo/flystockdb.git

First, we need to generate and extract some positional and feature-type
information from FlyBase, which will be used when entering genotypes:

    cd flystockdb/support/scripts
    ./create_stocks.rb FBYYYY_MM gazebo gazebo
    ./doall.sh FBYYYY_MM gazebo gazebo
    cd ../../..

Gazebo is dependend on supporting software, which has to installed as well:

    cd Gazebo/support
    (follow the instructions in README)
    cd ../..

flystockdb is a contribution to the Gazebo framework, so we need to introduce it to Gazebo:

    cd Gazebo/client
    git update-index --assume-unchanged config.json
    vi config.json
    cd ../..

It is necessary to compile flystockdb before it can be accessed through the web:

    cd Gazebo
    rake
    cd ..

Icons are not copied automatically, which has to be carried out manually:

    cd Gazebo/client/build/resource
    cp -R ../../../../flystockdb/fly/trunk/source/resource/fly .
    cd ../../../..
    cp flystockdb/favicon.ico Gazebo/sites/Gazebo/htdocs

Finally, the web-server has to be configured and started:

    cd Gazebo/sites/Gazebo
    git update-index --assume-unchanged conf/httpd.conf
    vi conf/httpd.conf
    mkdir logs
    httpd -f conf/httpd.conf -d `pwd`

Licences
--------

<span style="color: #0099cc;">fly</span><span style="color: #009966;">stock</span><span style="color: #333333;">db</span>
is licenced under the [Simplified BSD-License](http://www.opensource.org/licenses/bsd-license.php).
The full licence-text can be found in the [LICENSE](https://github.com/joejimbo/flystockdb/blob/master/LICENSE)
file.

The PNG-files in

* `fly/trunk/source/resource/fly/black`
* `fly/trunk/source/resource/fly/gray_light`
* `fly/trunk/source/resource/fly/blue`
* `fly/trunk/source/resource/fly/orange`
* `fly/trunk/source/resource/fly/green`

are part of the [Iconic](http://somerandomdude.com/projects/iconic/) minimal set of icons by
P.J. Onori. These icons are licenced under the
[Attribution-ShareAlike 3.0 United States](http://creativecommons.org/licenses/by-sa/3.0/us/)
Creative Commons License.

