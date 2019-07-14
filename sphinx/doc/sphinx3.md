Sphinx 3
=========

Sphinx is a free, dual-licensed search server. Sphinx is written in C++,
and focuses on query performance and search relevance.

The primary client API is currently SphinxQL, a dialect of SQL. Almost any
MySQL connector should work. Additionally, basic HTTP/JSON API and native APIs
for a number of languages (PHP, Python, Ruby, C, Java) are provided.

This document is an effort to build a better documentation for Sphinx 3 and up.
Think of it as a book or a tutorial which you would actually *read*; think of
the previous "reference manual" as of a "dictionary" where you look up specific
syntax features. The two might (and should) eventually converge.


WIP notice
-----------

Sphinx 3 is currently (early 2018) still under active refactoring, so a lot
of things might and *will* change in the future.

I will try to mark those as WIP (Work In Progress), but be patient if things
in your current build aren't as documented here. That simply means that the
behavior already changed but the docs just did not catch up. Do submit a bug
report!


Features overview
------------------

Top level picture, what does Sphinx 3 offer?

  * SQL, HTTP/JSON, and custom native SphinxAPI access APIs
  * NRT (Near Real Time) and offline batch indexing
  * Full-text and non-text (parameter) searching
  * Relevance ranking, from basic formulas to ML models
  * Federated results from multiple servers
  * Decent performance

Other things that seem worth mentioning (this list is probably incomplete at
all times, and definitely in random order):

  * Morphology and text-processing tools
    * Fully flexible tokenization (see `charset_table` and `exceptions`)
    * Proper morphology (lemmatizer) for English, Russian, and German
      (see `morphology`)
    * Basic morphology (stemmer) for many other languages
    * User-specified wordforms, `core 2 duo => c2d`
  * Native JSON support
  * Geosearch support
  * Fast expressions engine
  * Query suggestions
  * Snippets builder
  * ...

And, of course, there is always stuff that we know we currently lack!

  * Index replication
  * ...


Features cheat sheet
---------------------

This section is supposed to provide a bit more detail on all the available
features; to cover them more or less fully; and give you some further pointers
into the specific reference sections (on the related config directives and
SphinxQL statements).

  * Full-text search queries, see `SELECT ... WHERE MATCH('this')` SphinxQL
    statement
    * Boolean matching operators (implicit AND, explicit OR, NOT, and brackets),
      as in `(one two) | (three !four)`
    * Boolean matching optimizations, see `OPTION boolean_simplify=1` in
      `SELECT` statement
    * Advanced text matching operators
      * Field restrictions, `@title hello world` or `@!title hello` or
        `@(title,body) any of the two` etc
      * In-field position restrictions, `@title[50] hello`
      * MAYBE operator for optional keyword matching, `cat MAYBE dog`
      * phrase matching, `"roses are red"`
      * quorum matching, `"pick any 3 keywords out of this entire set"/3`
      * proximity matching, `"within 10 positions all terms in yoda order"~10`
        or `hello NEAR/3 world NEAR/4 "my test"`
      * strict order matching, `(bag of words) << "exact phrase" << this|that`
      * sentence matching, `all SENTENCE words SENTENCE "in one sentence"`
      * paragraph matching, `"Bill Gates" PARAGRAPH "Steve Jobs"`
      * zone and zone-span matching, `ZONE:(h3,h4) in any of these title tags`
        and `ZONESPAN:(h2) only in a single instance`
    * Keyword modifiers (that can usually be used within operators)
      * exact (pre-morphology) form modifier, `raining =cats and =dogs`
      * field-start and field-end modifiers, `^hello world$`
      * IDF (ranking) boost, `boosted^1.234`
    * Substring and wildcard searches
      * see `min_prefix_len` and `min_infix_len` directives
      * use `th?se three keyword% wild*cards *verywher*` (`?` = 1 char exactly;
        `%` = 0 or 1 char; `*` = 0 or more chars)
  * ...

TODO: describe more, add links!


Getting started
----------------

That should now be rather simple. No magic installation required! On any
platform, the *sufficient* thing to do is:

  1. Get the binaries.
  2. Run `searchd`
  3. Create indexes.
  4. Run queries.

Or alternatively, you can ETL your data offline, using the `indexer` tool:

  1. Get the binaries.
  2. Create `sphinx.conf`
  3. Run `indexer --all` once, to initially create the indexes.
  4. Run `searchd`
  5. Run queries.
  6. Run `indexer --all --rotate` regularly, to update the indexes.

Note that instead of inserting the data into indexes online, the `indexer` tool
instead creates a shadow copy of the specified index(es) offline, and then
sends a signal to `searchd` to pick up that copy. So you should *never* get
a partially populated index with `indexer`; it's always all-or-nothing.

### Getting started on Linux (and MacOS)

Versions and file names *will* vary, and you most likely *will* want to
configure Sphinx at least a little, but for an immediate quickstart:

```bash
$ wget -q http://sphinxsearch.com/files/sphinx-3.0.2-2592786-linux-amd64.tar.gz
$ tar zxf sphinx-3.0.2-2592786-linux-amd64.tar.gz
$ cd sphinx-3.0.2-2592786-linux-amd64/bin
$ ./searchd
Sphinx 3.0.2 (commit 2592786)
Copyright (c) 2001-2018, Andrew Aksyonoff
Copyright (c) 2008-2016, Sphinx Technologies Inc (http://sphinxsearch.com)

listening on all interfaces, port=9312
listening on all interfaces, port=9306
WARNING: No extra index definitions found in data folder
$
```

That's it; the daemon should now be running and accepting connections on port
9306. And you can connect to it using MySQL CLI (see below for more details, or
just try `mysql -P9306` right away).

### Getting started on Windows

Pretty much the same story, except that on Windows `searchd` will not
automatically go into background:

```
C:\Sphinx\>searchd.exe
Sphinx 3.0-dev (c3c241f)
...
accepting connections
prereaded 0 indexes in 0.000 sec
```

This is alright. Do not kill it. Just switch to a separate session and start
querying.

### Running queries via MySQL shell

Run the MySQL CLI and point it to a port 9306. For example on Windows:

```
C:\>mysql -h127.0.0.1 -P9306
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1
Server version: 3.0-dev (c3c241f)
...
```

I have intentionally used `127.0.0.1` in this example for two reasons (both
caused by MySQL CLI quirks, not Sphinx):

  * sometimes, an IP address is required to use the `-P9306` switch,
    not `localhost`
  * sometimes, `localhost` works but causes a connection delay

But in the simplest case even just `mysql -P9306` should work fine.

And from there, just run SphinxQL queries:

```sql
mysql> CREATE TABLE test (gid integer, title field stored,
    -> content field stored);
Query OK, 0 rows affected (0.00 sec)

mysql> INSERT INTO test (id, title) VALUES (123, 'hello world');
Query OK, 1 row affected (0.00 sec)

mysql> INSERT INTO test (id, gid, content) VALUES (234, 345, 'empty title');
Query OK, 1 row affected (0.00 sec)

mysql> SELECT * FROM test;
+------+------+-------------+-------------+
| id   | gid  | title       | content     |
+------+------+-------------+-------------+
|  123 |    0 | hello world |             |
|  234 |  345 |             | empty title |
+------+------+-------------+-------------+
2 rows in set (0.00 sec)

mysql> SELECT * FROM test WHERE MATCH('hello');
+------+------+-------------+---------+
| id   | gid  | title       | content |
+------+------+-------------+---------+
|  123 |    0 | hello world |         |
+------+------+-------------+---------+
1 row in set (0.00 sec)

mysql> SELECT * FROM test WHERE MATCH('@content hello');
Empty set (0.00 sec)

```

SphinxQL is our own SQL dialect. More details on the supported statements are
currently available in 2.x docs, see
[SphinxQL Reference](sphinx2.html#sphinxql-reference)

### Running queries from PHP, Python, etc

```php
<?php

$conn = mysqli_connect("127.0.0.1:9306", "", "", "");
if (mysqli_connect_errno())
	die("failed to connect to Sphinx: " . mysqli_connect_error());

$res = mysqli_query($conn, "SHOW VARIABLES");
while ($row = mysqli_fetch_row($res))
	print "$row[0]: $row[1]\n";
```

TODO: examples

### Running queries via HTTP

TODO: examples

### Installing `indexer` SQL drivers on Linux

This only affects `indexer` ETL tool only. If you never bulk load data from SQL
sources using it (of course CSV and XML sources are still fine), you can safely
skip this section. (And on Windows all the drivers come with the package.)

Depending on your OS, the required package names may vary. Here are some
current (as of Mar 2018) package names for Ubuntu and CentOS:

```bash
ubuntu$ apt-get install libmysqlclient-dev libpq-dev unixodbc-dev
ubuntu$ apt-get install libmariadb-client-lgpl-dev-compat

centos$ yum install mariadb-devel postgresql-devel unixODBC-devel
```

Why might these be needed, and how they work?

`indexer` natively supports MySQL (or MariaDB), PostgreSQL, and UnixODBC
drivers. Meaning it can natively connect to those databases, run SQL queries,
extract results, and create full-text indexes from that. Binaries now always
come with that *support* enabled.

However, you still need to have a specific driver *library* installed on your
system, so that `indexer` could dynamically load it, and access the database.
Depending on the specific database and OS you use, the package names might be
different, but here go a few common pointers.

The driver libraries are loaded by name. The following names are attempted:

  * MySQL: `libmysqlclient.so` or `libmariadb.so`
  * PostgreSQL: `libpq.so`
  * ODBC: `libodbc.so`

To support MacOS, `.dylib` extension (in addition to `.so`) is also tried.


Main concepts
--------------

Alas, many projects tend to reinvent their own dictionary, and Sphinx is
no exception. Sometimes that probably creates confusion for no apparent reason.
For one, what SQL guys call "tables" (or even "relations" if they are old enough
to remember Edgar Codd), and MongoDB guys call "collections", we the text search
guys tend to call "indexes", and not really out of mischief and malice either,
but just because for us, those things *are* primarily FT (full-text) indexes.
Thankfully, most of the concepts are close enough, so our personal little Sphinx
dictionary is tiny. Let's see.

Short cheat-sheet!

| Sphinx             | Closest SQL equivalent                   |
|--------------------|------------------------------------------|
| Index              | Table                                    |
| Document           | Row                                      |
| Field or attribute | Column and/or a FULLTEXT index           |
| Indexed field      | *Just* a FULLTEXT index on a text column |
| Stored field       | Text column *and* a FULLTEXT index on it |
| Attribute          | Column                                   |
| MVA                | Column with an INT_SET type              |
| JSON attribute     | Column with a JSON type                  |
| Attribute index    | Index                                    |
| Document ID, docid | Column called "id", with a BIGINT type   |
| Row ID, rowid      | Internal Sphinx row number               |

And now for a little more elaborate explanation.

### Indexes

Sphinx indexes are semi-structured collections of documents. They may seem
closer to SQL tables than to Mongo collections, but in their core, they really
are neither. The primary, foundational data structure here is a *full-text
index*. It is a special structure that lets us respond very quickly to a query
like "give me the (internal) identifiers of all the documents that mention This
or That keyword". And everything else (any extra attributes, or document
storage, or even the SQL or HTTP querying dialects, and so on) that Sphinx
provides is essentially some kind of an addition on top of that base data
structure. Well, hence the "index" name.

Schema-wise, Sphinx indexes try to combine the best of schemaful and schemaless
worlds. For "columns" where you know the type upfront, you can use the
statically typed attributes, and get the absolute efficiency. For more dynamic
data, you can put it all into a JSON attribute, and still get quite decent
performance.

So in a sense, Sphinx indexes == SQL tables, except (a) full-text searches are
fast and come with a lot of full-text-search specific tweaking options; (b) JSON
"columns" (attributes) are quite natively supported, so you can go schemaless;
and (c) for full-text indexed fields, you can choose to store *just* the
full-text index and ditch the original values.

### Documents

Documents are essentially just a list of named text fields, and arbitrary-typed
attributes. Quite similar to SQL rows; almost indistiguishable, actually.

As of 3.0.1, Sphinx still requires a unique `id` attribute, and implicitly
injects an `id BIGINT` column into indexes (as you probably noticed in the
[Getting started](#getting-started) section). We still use those docids to
identify specific rows in `DELETE` and other statements. However, unlike in 2.x,
we no longer use docids to identify documents internally. Thus, zero and
negative docids are already allowed.

### Fields

Fields are the texts that Sphinx indexes and makes keyword-searchable. They
always are *indexed*, as in full-text indexed. Their original, unindexed
contents can also be *stored* into the index for later retrieval. By default,
they are not, and Sphinx is going to return attributes only, and *not* the
contents. However, if you explicitly mark them as stored (either with
a `stored` flag in `CREATE TABLE` or in the ETL config file using
`stored_fields` directive), you can also fetch the fields back:

```sql
mysql> CREATE TABLE test1 (title field);
mysql> INSERT INTO test1 VALUES (123, 'hello');
mysql> SELECT * FROM test1 WHERE MATCH('hello');
+------+
| id   |
+------+
|  123 |
+------+
1 row in set (0.00 sec)

mysql> CREATE TABLE test2 (title field stored);
mysql> INSERT INTO test2 VALUES (123, 'hello');
mysql> SELECT * FROM test2 WHERE MATCH('hello');
+------+-------+
| id   | title |
+------+-------+
|  123 | hello |
+------+-------+
1 row in set (0.00 sec)
```

Stored fields contents are stored in a special index component called document
storage, or DocStore for short.

### Attributes

Sphinx supports the following attribute types:

  * INTEGER, unsigned 32-bit integer
  * BIGINT, signed 64-bit integer
  * FLOAT, 32-bit (single precision) floating point
  * BOOL, 1-bit boolean
  * STRING, a text string
  * JSON, a JSON document
  * MVA, an order-insensitive set of unique INTEGERs
  * MVA64, an order-insensitive set of unique BIGINTs

All of these should be pretty straightforward. However, there are a couple
Sphinx specific JSON performance tricks worth mentioning:

  * All scalar values (integers, floats, doubles) are converted and internally
    stored natively.
  * All scalar value *arrays* are detected and also internally stored natively.
  * You can use `123.45f` syntax extension to mark 32-bit floats (by default all
    floating point values in JSON are 64-bit doubles).

For example, when the following document is stored into a JSON column in Sphinx:
```json
{"title":"test", "year":2017, "tags":[13,8,5,1,2,3]}
```
Sphinx detects that the "tags" array consists of integers only, and stores the
array data using 24 bytes exactly, using just 4 bytes per each of the 6 values.
Of course, there still are the overheads of storing the JSON keys, and the
general document structure, so the *entire* document will take more than that.
Still, when it comes to storing bulk data into Sphinx index for later use, just
provide a consistently typed JSON array, and that data will be stored - and
processed! - with maximum efficiency.

Attributes are supposed to fit into RAM, and Sphinx is optimized towards that
case. Ideally, of course, all your index data should fit into RAM, while being
backed by a fast enough SSD for persistence.

Now, there are *fixed-width* and *variable-width* attributes among the
supported types. Naturally, scalars like INTEGER and FLOAT will always occupy
exactly 4 bytes each, while STRING and JSON types can be as short as, well,
empty; or as long as several megabytes. How does that work internally? Or in
other words, why don't I just save everything as JSON?

The answer is performance. Internally, Sphinx has two separate storages for
those row parts. Fixed-width attributes, including hidden system ones, are
essentially stored in big static NxM matrix, where N is the number of rows, and
M is the number of fixed-width attributes. Any accesses to those are very quick.
All the variable-width attributes for a single row are grouped together, and
stored in a separate storage. A single offset into that second storage (or
"vrow" storage, short for "variable-width row part" storage) is stored as hidden
fixed-width attribute. Thus, as you see, accessing a string or a JSON or an MVA
value, let alone a JSON key, is somewhat more complicated. For example, to
access that `year` JSON key from the example just above, Sphinx would need to:

  * read `vrow_offset` from a hidden integer attribute
  * access the vrow part using that offset
  * decode the vrow, and find the needed JSON attribute start
  * decode the JSON, and find the `year` key start
  * check the key type, just in case it needs conversion to integer
  * finally, read the `year` value

Of course, optimizations are done on every step here, but still, if you access
a *lot* of those values (for sorting or filtering the query results), there will
be a performance impact. Also, the deeper the key is buried into that JSON, the
worse. For example, using a tiny test with 1,000,000 rows and just 4 integer
attributes plus exactly the same 4 values stored in a JSON, computing a sum
yields the following:

| Attribute    | Time      | Slowdown  |
|--------------|-----------|-----------|
| Any INT      | 0.032 sec | -         |
| 1st JSON key | 0.045 sec | 1.4x      |
| 2nd JSON key | 0.052 sec | 1.6x      |
| 3rd JSON key | 0.059 sec | 1.8x      |
| 4th JSON key | 0.065 sec | 2.0x      |

And with more attributes it would eventually slowdown even worse than 2x times,
especially if we also throw in more complicated attributes, like strings or
nested objects.

So bottom line, why not JSON everything? As long as your queries only touch
a handful of rows each, that is fine, actually! However, if you have a *lot* of
data, you should try to identify some of the "busiest" columns for your queries,
and store them as "regular" typed columns, that somewhat improves performance.


Using DocStore
---------------

Storing fields into your indexes is easy, just list those fields in a
`stored_fields` directive and you're all set:

```
index mytest
{
	type = rt
	path = data/mytest

	rt_field = title
	rt_field = content
	stored_fields = title, content
	# hl_fields = title, content

	rt_attr_uint = gid
}
```

Let's check how that worked:

```
mysql> desc mytest;
+---------+--------+-----------------+------+
| Field   | Type   | Properties      | Key  |
+---------+--------+-----------------+------+
| id      | bigint |                 |      |
| title   | field  | indexed, stored |      |
| content | field  | indexed, stored |      |
| gid     | uint   |                 |      |
+---------+--------+-----------------+------+
4 rows in set (0.00 sec)

mysql> insert into mytest (id, title) values (123, 'hello world');
Query OK, 1 row affected (0.00 sec)

mysql> select * from mytest where match('hello');
+------+------+-------------+---------+
| id   | gid  | title       | content |
+------+------+-------------+---------+
|  123 |    0 | hello world |         |
+------+------+-------------+---------+
1 row in set (0.00 sec)
```

Yay, original document contents! Not a huge step generally, not for a database
anyway; but a nice improvement for Sphinx which was initially designed "for
searching only" (oh, the mistakes of youth). And DocStore can do more than that,
namely:

  * store indexed fields, `store_fields` directive
  * store unindexed fields, `stored_only_fields` directive
  * store precomputed data to speedup snippets, `hl_fields` directive
  * be fine-tuned a little, using `docstore_type`, `docstore_comp`, and
    `docstore_block` directives

So DocStore can effectively replace the existing `rt_field_string` directive.
What are the differences, and when to use each?

`rt_field_string` creates an *attribute*, uncompressed, and stored in RAM.
Attributes are supposed to be small, and suitable for filtering (WHERE), sorting
(ORDER BY), and other operations like that, by the millions. So if you really
need to run queries like ... WHERE title='abc', or in case you want to update
those strings on the fly, you will still need attributes.

But complete original document contents are rather rarely accessed in *that*
way! Instead, you usually need just a handful of those, in the order of 10s to
100s, to have them displayed in the final search results, and/or create
snippets. DocStore is designed exactly for that. It compresses all the data it
receives (by default), and tries to keep most of the resulting "archive" on
disk, only fetching a few documents at a time, in the very end.

Snippets become pretty interesting with DocStore. You can generate snippets
from either specific stored fields, or the entire document, or a subdocument,
respectively:

```sql
SELECT id, SNIPPET(title, QUERY()) FROM mytest WHERE MATCH('hello')
SELECT id, SNIPPET(DOCUMENT(), QUERY()) FROM mytest WHERE MATCH('hello')
SELECT id, SNIPPET(DOCUMENT({title}), QUERY()) FROM mytest WHERE MATCH('hello')
```

Using `hl_fields` can accelerate highlighting where possible, sometimes making
snippets *times* faster. If your documents are big enough (as in, a little
bigger than tweets), try it! Without `hl_fields`, SNIPPET() function will have
to reparse the document contents every time. With it, the parsed representation
is compressed and stored into the index upfront, trading off a not-insignificant
amount of CPU work for more disk space, and a few extra disk reads.

And speaking of disk space vs CPU tradeoff, these tweaking knobs let you
fine-tune DocStore for specific indexes:

  * `docstore_type = vblock_solid` (default) groups small documents into
    a single compressed block, upto a given limit: better compression,
    slower access
  * `docstore_type = vblock` stores every document separately: worse
    compression, faster access
  * `docstore_block = 16k` (default) lets you tweak the block size limit
  * `docstore_comp = lz4hc` (default) uses LZ4HC algorithm for compression:
     better compression, but slower
  * `docstore_comp = lz4` uses LZ4 algorithm: worse compression, but faster
  * `docstore_comp = none` disables compression


Using attribute indexes
------------------------

Quick kickoff: we now have `CREATE INDEX` statement, and sometimes it *does*
make your queries faster!

```sql
CREATE INDEX i1 ON mytest(group_id)
DESC mytest
SELECT * FROM mytest WHERE group_id=1
SELECT * FROM mytest WHERE group_id BETWEEN 10 and 20
SELECT * FROM mytest WHERE MATCH('hello world') AND group_id=23
DROP INDEX i1 ON mytest
```

Point reads, range reads, and intersections between `MATCH()` and index reads
are all intended to work. Moreover, `GEODIST()` can also automatically use
indexes (see more below). One of the goals is to completely eliminate the need
to insert "fake keywords" into your index. (Also, it's possible to *update*
attribute indexes on the fly, as opposed to indexed text.)

Indexes on JSON keys should also work, but you might need to cast them to
a specific type when creating the index:
```sql
CREATE INDEX j1 ON mytest(j.group_id)
CREATE INDEX j2 ON mytest(INTEGER(j.year))
CREATE INDEX j3 ON mytest(FLOAT(j.latitude))
```

As of version 3.0.2, attribute indexes can only be created on RT indexes.
However, you can *instantly* convert your plain indexes to RT by using
`ATTACH ... WITH TRUNCATE`, and run `CREATE INDEX` after that, as follows:
```sql
ATTACH INDEX myplain TO myrt WITH TRUNCATE
CREATE INDEX date_added ON myrt(date_added)
```

A rather important optimization of `GEODIST()` automatically kicks in when you
(a) use the form with 2 columns and 2 constants, and (b) then use the result in
a filter, as follows:
```sql
SELECT *, GEODIST(lat,lon,55.7540,37.6206,{in=deg,out=km}) AS dist
  FROM myindex WHERE dist<=100
```
In this example, the query optimizer will automatically compute the approximate
bounding box (i.e. minimum and maximum possible `lat` and `lon` values that are
within the 100 km distance), and utilize the indexes on both `lat` and `lon`
columns if they are available, and even intersect the index read results first
if the indexes on *both* columns exist. For small distances (i.e. within one
city or so), the speedup is usually huge. Also note that in a slightly different
query the optimization might *not* trigger, for example:
```sql
SELECT *, GEODIST(lat,lon,55.7540,37.6206,{in=deg,out=km})<=100 AS bad_dist_flag
  FROM myindex WHERE bad_dist_flag=1
```
This is because the `WHERE` optimizer is a simpleton! It does not go too deep,
and basically while in the first case it can immediately "sees" that `dist` is
actually a `GEODIST()` and then examines it further, in the second case it only
"sees" some kind of an arbitrary expression, and stops there.


TODO: describe more!


Using k-batches
----------------

K-batches ("kill batches") let you bulk delete older versions of the documents
(rows) when bulk loading new data into Sphinx, for example, adding a new delta
index on top of an older main archive index.

K-batches in Sphinx 3 replace k-lists ("kill lists") from 2.x and before.
The major differences are that:

  1. They are *not* anonymous anymore.
  2. They are now only applied once on loading. (As oppposed to every search,
     yuck).

"Not anonymous" means that when loading a new index with an associated k-batch
into `searchd`, **you now have to explicitly specify target indexes** that it
should delete the rows from. In other words, "deltas" now *must* explicitly
specify all the "main" indexes that they want to erase old documents from,
at index-time.

The effect of applying a k-batch is equivalent to running (just once) a bunch
of DELETE FROM X WHERE id=Y queries, for every index X listed in `kbatch`
directive, and every document id Y stored in the k-batch. With the index format
updates this is now both possible, **even in "plain" indexes**, and quite
efficient too.

K-batch only gets applied once. After a succesful application to all the target
indexes, the batch gets cleared.

So, for example, when you load an index called `delta` with the following
settings:

```
index delta
{
	...
	sql_query_kbatch = SELECT 12 UNION SELECT 13 UNION SELECT 14
	kbatch = main1, main2
}
```

The following (normally) happens:

  * `delta` kbatch file is loaded
    * in this example it will have 3 document ids: 12, 13, and 14
  * documents with those ids are deleted from `main1`
  * documents with those ids are deleted from `main2`
  * `main1`, `main2` save those deletions to disk
  * if all went well, `delta` kbatch file is cleared

All these operations are pretty fast, because deletions are now internally
implemented using a bitmap. So deleting a given document by id results in a hash
lookup and a bit flip. In plain speak, very quick.

"Loading" can happen either by restarting or rotation or whatever, k-batches
should still try to apply themselves.

Last but not least, you can also use `kbatch_source` to avoid explicitly
storing all newly added document ids into a k-batch, instead, you can use
`kbatch_source = kl, id` or just `kbatch_source = id`; this will automatically
add all the document ids from the index to its k-batch. The default value is
`kbatch_source = kl`, that is, to use explicitly provided docids only.


Doing bulk data loads
----------------------

TODO: describe rotations (legacy), RELOAD, ATTACH, etc.


Using JSON
-----------

TODO: describe limits, key count impact, key compression, all the json_xxx
settings, etc.


Indexing: CSV and TSV files
----------------------------

`indexer` supports indexing data in both CSV and TSV formats, via the `csvpipe`
and `tsvpipe` source types, respectively. Here's a brief cheat sheet on the
respective source directives.

  * `csvpipe_command = ...` specifies a command to run (for instance,
    `csvpipe_command = cat mydata.csv` in the simplest case).
  * `csvpipe_header = 1` tells the `indexer` to pick the column list from the
    first row (otherwise, by default, the column list has to be specified in the
    config file).
  * `csvpipe_attr_XXX` (where `XXX` is an attribute type, i.e. one of `bigint`,
    `bool`, `float`, `json`, `multi`, `multi_64`, `string`, `timestamp`, or
    `uint`) specifies an attribute type for a given column.
  * `csvpipe_field` and `csvpipe_field_string` specify a regular full-text field
    and a full-text field that should also be stored as a `string` attribute,
    respectively.
  * `csvpipe_delimiter` changes the column delimiter to a given character (this
    is `csvpipe` only; `tsvpipe` naturally uses tabs).

When working with TSV, you would use the very same directives, but start them
with `tsvpipe` prefix (i.e. `tsvpipe_command`, `tsvpipe_header`, etc).

The first column is currently always treated as `id`, and must be a unique
document identifier.

The first row can either be treated as a named list of columns (when
`csvpipe_header = 1`), or as a first row of actual data. By default it's treated
as data. The column names are trimmed, so a bit of extra whitespace should not
hurt.

`csvpipe_header` affects how CSV input columns are matched to Sphinx attributes
and fields.

With `csvpipe_header = 0` the input file only contains data, so the order of
columns is taken from the config file. Thus, the order of `csvpipe_attr_XXX`
and `csvpipe_field` directives is very important in this case. You will have to
explicitly declare *all* the fields and attributes (except the leading `id`),
and in *exactly* the same order they appear in the CSV file. `indexer` will warn
if there were unmatched or extraneous columns.

With `csvpipe_header = 1` the input file starts with the column names list, so
the declarations from the config file are only used to adjust the types. So in
this case, the order of `csvpipe_attr_XXX` and `csvpipe_field` directives does
not matter any more. Also, by default all the input CSV columns will be
considered as fields, so you only need to explicitly configure attributes, not
fields. For example, the following should work nicely, and index `title` and
`content` as fields automatically:

```
1.csv:

id, gid, title, content
123, 11, hello world, document number one
124, 12, hello again, document number two

sphinx.conf:

source csv1
{
    type = csvpipe
    csvpipe_command = cat 1.csv
    csvpipe_header = 1
    csvpipe_attr_uint = gid
}
```


Indexing: special chars, blended tokens, and mixed codes
---------------------------------------------------------

Sphinx provides tools to help you better index (and then later search):

  * terms that have special characters in them, like `@Rihanna`,
    or `Procter&Gamble` or `U.S.A`, etc;
  * terms that mix letters and digits, like `UE53N5740AU`.

The general approach, so-called "blending", is the same in both cases:

  * we always store a certain "base" (most granular) tokenization;
  * we also additonally store ("blend") extra tokens, as configured;
  * we then let you search for either original or extra tokens.

So in the examples just above Sphinx can:

  * index base tokens, such as `rihanna` or `ue53n5740au`;
  * index special tokens, such as `@rihanna`;
  * index parts of mixed-codes tokens, such as `ue 53` and `ue53`.

### Blended tokens (with special characters)

To index **blended tokens**, i.e. tokens with special characters in them,
you should:

  * add your special "blended" characters to the `blend_chars` directive;
  * configure several processing modes for the extra tokens (optionally) using
    the `blend_mode` directive;
  * rebuild your index.

Blended characters are going to be indexed both as separators, and *at the same
time* as valid characters. They are considered separators when generating the
base tokenization (or "base split" for short). But in addition they also are
processed as valid characters when generating extra tokens.

For instance, when you set `blend_chars = @, &, .` and index the text `@Rihanna
Procter&Gamble U.S.A`, the base split stores the following six tokens into the
final index: `rihanna`, `procter`, `gamble`, `u`, `s`, and `a`. Exactly like it
would without the `blend_chars`, based on just the `charset_table`.

And because of `blend_chars` settings, the following three *extra* tokens get
stored: `@rihanna`, `procter&gamble`, and `u.s.a`. Regular characters are still
case-folded according to `charset_table`, but those special blended characters
are now preserved. As opposed to being treated as whitespace, like they were in
the base split. So far so good.

But why not just add `@, &, .` to `charset_table` then? Because that way
we would completely lose the base split. *Only* the three "magic" tokens like
`@rihanna` would be stored. And then searching for their "parts" (for example,
for just `rihanna` or just `gamble`) would not work. Meh.

Last but not least, the in-field token positions are adjusted accordingly, and
shared between the base and extra tokens:

  * pos 1, `rihanna` and `@rihanna`
  * pos 2, `procter` and `procter&gamble`
  * pos 3, `gamble`
  * pos 4, `u` and `u.s.a`
  * pos 5, `s`
  * pos 6, `a`

Bottom line, `blend_chars` lets you enrich the index and store extra tokens
with special characters in those. That might be a handy addition to your regular
tokenization based on `charset_table`.

### Mixed codes (with letters and digits)

To index **mixed codes**, i.e. terms that mix letters and digits, you need to
enable `blend_mixed_codes = 1` setting (and reindex).

That way Sphinx adds extra spaces on *letter-digit boundaries* when making the
base split, but still stores the full original token as an extra. For example,
`UE53N5740AU` gets broken down to as much as 5 parts:

  * pos 1, `ue` and `ue53n5740au`
  * pos 2, `53`
  * pos 3, `n`
  * pos 4, `5740`
  * pos 5, `au`

Besides the "full" split and the "original" code, it is also possible to store
prefixes and suffixes. See `blend_mode` discussion just below.

Also note that on certain input data mixed codes indexing can generate a lot of
undesired noise tokens. So when you have a number of fields with special terms
that do *not* need to be processed as mixed codes (consider either terms like
`_category1234`, or just long URLs), you can use the `mixed_codes_fields`
directive and limit mixed codes indexing to human-readable text fields only.
For instance:

```
blend_mixed_codes = 1
mixed_codes_fields = title, content
```

That could save you a noticeable amount of both index size and indexing time.

### Blending modes

There's somewhat more than one way to generate extra tokens. So there is
a directive to control that. It's called `blend_mode` and it lets you list all
the different processing variants that you require:

  * `trim_none`, store a full token with all the blended characters;
  * `trim_head`, store a token with heading blended characters trimmed;
  * `trim_tail`, store a token with trailing blended characters trimmed;
  * `trim_both`, store a token with both heading and trailing blended
    characters trimmed;
  * `skip_pure`, do *not* store tokens that only contain blended characters;
  * `prefix_tokens`, store all possible prefix tokens;
  * `suffix_tokens`, store all possible suffix tokens.

To visualize all those trims a bit, consider the following setup:
```
blend_chars = @, !
blend_mode = trim_none, trim_head, trim_tail, trim_both

doc_title = @someone!
```

Quite a bunch of extra tokens will be indexed in this case:

  * `someone` for the base split;
  * `@someone!` for `trim_none`;
  * `someone!` for `trim_head`;
  * `@someone` for `trim_tail`;
  * `someone` (yes, again) for `trim_both`.

`trim_both` option might seem redundant here for a moment. But do consider
a bit more complicated term like `&U.S.A!` where all the special characters are
blended. It's base split is three tokens (`u`, `s`, and `a`); it's original full
form (stored for `trim_none`) is lower-case `&u.s.a!`; and so for this term
`trim_both` is the only way to still generate the cleaned-up `u.s.a` variant.

`prefix_tokens` and `suffix_tokens` actually begin to generate something
non-trivial on that very same `&U.S.A!` example, too. For the record, that's
because its base split is long enough, 3 or more tokens. `prefix_tokens` would
be the only way to store the (useful) `u.s` prefix; and `suffix_tokens` would
in turn store the (questionable) `s.a` suffix.

But `prefix_tokens` and `suffix_tokens` modes are, of course, especially
useful for indexing mixed codes. The following gets stored with
`blend_mode = prefix_tokens` in our running example:

  * pos 1, `ue`, `ue53`, `ue53n`, `ue53n5740`, and `ue53n5740au`
  * pos 2, `53`
  * pos 3, `n`
  * pos 4, `5740`
  * pos 5, `au`

And with `blend_mode = suffix_tokens` respectively:

  * pos 1, `ue` and `ue53n5740au`
  * pos 2, `53` and `53n5740au`
  * pos 3, `n` and `n5740au`
  * pos 4, `5740` and `5740au`
  * pos 5, `au`

Of course, there still can be missing combinations. For instance, `ue 53n`
query will still not match any of that. However, for now we intentionally
decided to avoid indexing *all* the possible base token subsequences, as that
seemed to produce way too much noise.

### Searching vs blended tokens and mixed codes

The rule of thumb is quite simple. All the extra tokens are **indexing-only**.
And in queries, all tokens are treated "as is".

**Blended characters** are going to be handled as valid characters in the
queries, and *require* matching.

For example, querying for `"@rihanna"` will *not* match `Robyn Rihanna Fenty
is a Barbadian-born singer` document. However, querying for just `rihanna` will
match both that document, and `@rihanna doesn't tweet all that much` document.

**Mixed codes** are *not* going to be automatically "sliced" in the queries.

For example, querying for `UE53` will *not* automatically match neither `UE 53`
nor `UE 37 53` documents. You need to manually add extra whitespace into your
query term for that.


Ranking: IDF magics
--------------------

Sphinx supports several different IDF (Inverse Document Frequency) calculation
options. Those can affect your relevance ranking (aka scoring) when you are:

  * *either* sharding your data, even with built-in rankers;
  * *or* doing any custom ranking work, even on a single shard.

By default, term IDFs are (a) per-shard, and (b) computed online. So they might
fluctuate significantly when ranking. And several other signals rely on them, so
the entire rank might change a lot in a seeimingly random fashion. The reasons
are twofold.

First, IDFs usually differ across shards (i.e. individual indexes that make up
a bigger combined index). This means that a completely identical document might
rank differently depending on a specific shard it ends up in. Not great.

Second, IDFs might change from query to query, as you update the index data.
That instability in time might or might not be a desired effect.

To help alleviate these quirks (if they affect your use case), Sphinx offers two
features:

  1. `local_df` option to aggregate sharded IDFs.
  2. `global_idf` feature to enforce prebuilt static IDFs.

`local_df` syntax is `SELECT ... OPTION local_df=1` and enabling that option
tells the query to compute IDFs (more) precisely, i.e. over the entire index
rather than individual shards. The default value is 0 (off) for performance
reasons.

`global_idf` feature is more complicated and includes several components:

  * `indextool --dumpdict --stats` switch that generates the source data, i.e.
    the per-shard dictionary dumps;
  * `indextool --buildidf` switch that builds a static IDF file from those;
  * per-shard `global_idf` config directive that lets you assign a static IDF
    file to your shards;
  * per-query `OPTION global_idf=1` that forces the query to use that file.

Both these features affect the input variables used for IDF calculations. More
specifically:

  * let `n` be the DF, document frequency (for a given term);
  * let `N` be the corpus size, total number of documents;
  * by default, both `n` and `N` are per-shard;
  * with `local_df`, they both are summed across shards;
  * with `global_idf`, they both are taken from a static IDF file.

The static `global_idf` file actually stores a bunch of `n` values for every
individual term, and the `N` value for the entire corpus, summed over all the
source files that were available during `--buildidf` stage. For terms that are
not present in the static `global_idf` file, their current (dynamic) DF values
will be used. `local_df` should also still affect those.

To avoid overflows, `N` is adjusted up for the actual corpus size. Meaning that,
for example, if the `global_idf` file says there were 1000 documents, but your
index carries 3000 documents, then `N` is set to the bigger value, i.e. 3000.
Therefore, you should either avoid using too small data slices for dictionary
dumps, and/or manually adjust the frequencies, otherwise your static IDFs might
be quite off.

To keep the `global_idf` file reasonably compact, you can use the additional
`--skip-uniq` switch when doing the `--buildidf` stage. That switch will filter
out all terms that only occur once. That usually reduces the `.idf` file size
greatly, while still yielding exact or almost-exact results.

Coming up next, when computing IDFs from the `n` and `N` inputs, Sphinx also
supports two IDF normalizations (one of them mostly for legacy reasons). Those
can be set with `OPTION idf` in the `SELECT` statement.

  * Sign normalization:
    * `normalized`: BM25 variant, `raw_idf = log(N-n+1)`, as per Robertson;
    * `plain`: plain variant, `raw_idf = log(N/n)`, as per Sparck-Jones.
  * Legacy query range normalization:
    * `tfidf_normalized`: `raw_idf = log(...) / query_word_count`;
    * `tfidf_unnormalized`: `raw_idf = log(...)`.

And last but not least, to compute the final `idf` value from the intermediate
`raw_idf` mentioned just above, Sphinx multiplies it by a couple more things:

  * `scaled_idf = raw_idf / (2*log(N+1))`
    * with `OPTION idf='normalized'` this gives `[-0.5, 0.5]` range;
    * with `OPTION idf='plain'` this gives `[0, 0.5]` range;
    * this is for compatibility with built-in rankers that expect that range.
  * `idf = scaled_idf * term_idf_boost`
    * this is, well, for query-time boosting of individual terms.

It is these final `idf` values that will be both used in the built-in rankers
*and* reported via `FACTORS()` or passed to expression-based and UDF rankers
(`OPTION ranker=expr(...)`). Yes, they are affected by all those options. Scary.

So what `OPTION idf` set to choose?! A quick rule of thumb is as follows:

  * When using built-in rankers, just use the defaults.
    * Currently, the defaults are `OPTION idf='normalized,tfidf_normalized'`
  * When making your own ranker, switch to the opposite settings.
    * Specifically, use `OPTION idf='plain,tfidf_unnormalized'`
    * Avoid using `tfidf_normalized` because it is slated for removal.
    * Also note that `atc` signal *only* produces expected results with these
      settings.


Ranking: picking fields with `rank_fields`
-------------------------------------------

When your indexes and queries contain any special "fake" keywords (usually used
to speedup matching), it makes sense to exclude those from ranking. That can be
achieved by putting such keywords into special fields, and then using `OPTION
rank_fields` clause in the `SELECT` statement to pick the fields with actual
text for ranking. For example:

```sql
SELECT id, weight(), title FROM myindex
WHERE MATCH('hello world @sys _category1234')
OPTION rank_fields='title content'
```

`rank_fields` is designed to work as follows. Only the keyword occurrences in
the ranked fields get processed when computing ranking factors. Any other
occurrences are ignored (by ranking, that is).

Note a slight caveat here: for *query-level* factors, only the *query* itself
can be analyzed, not the index data.

This means that when you do not explicitly specify the fields in the query, the
query parser *must* assume that the keyword can actually occur anywhere in the
document. And, for example, `MATCH('hello world _category1234')` will compute
`query_word_count=3` for that reason. This query does indeed have 3 keywords,
even if `_category1234` never *actually* occurs anywhere except `sys` field.

Other than that, `rank_fields` is pretty straightforward. *Matching* will still
work as usual. But for *ranking* purposes, any occurrences (hits) from the
"system" fields can be ignored and hidden.


Changes in 3.x
---------------

### Version 3.1.1, 17 oct 2018

* added `indexer --dump-rows-tsv` switch, and renamed `--dump-rows` to
  `--dump-rows-sql`
* added initial `COALESCE()` function support for JSONs (beware that it will
  compute everything in floats!)
* added support for `!=`, `IN`, and `NOT IN` syntax to expressions
* added `prefix_tokens` and `suffix_tokens` options to `blend_mode` directive
* added `OPTION rank_fields`, lets you specify fields to use for ranking with
  either expression or ML (UDF) rankers
* added explicit duplicate documents (docids) suppression back into `indexer`
* added `batch_size` variable to `SHOW META`
* added `csvpipe_header` and `tsvpipe_header` directives
* added `sql_xxx` counters to `SHOW STATUS`, generally cleaned up counters
* added mixed codes indexing, available via `blend_mixed_codes` and
  `mixed_codes_fields` directives
* added `OPTION inner_limit_per_index` to explicitly control reordering in
  a nested sharded select
* added a hard limit for `max_matches` (must be under 100M)
* optimized Postgres indexing CPU and RAM use quite significantly
* optimized `FACET` queries with expressions and simple by-attribute
  (no aliases!) facets; multi-sort optmization now works in that case
* optimized `id` lookups (queries like `UPDATE ... WHERE id=123` should now be
  much faster)
* optimized result set aggregation vs nested sharded selects
* optimized `PACKEDFACTORS()` storage a lot (upto 60x speedup with
  `max_matches=50000`)
* improved UDF error handling, the error argument is now a message buffer
  instead of just a 1-char flag
* improved the nested sharded select reordering, less confusing now (by default,
  does *not* scale the inner `LIMIT` anymore)
* improved `searchd --listen` switch, multiple `--listen` instances are now
  allowed, and `--console` is *not* required anymore
* improved failed allocation reporting, and added huge allocation tracking
* removed legacy `@count`, `@weight`, `@expr`, `@geodist` syntax support
* removed legacy `SetWeights()`, `SetMatchMode()`, `SetOverride()`,
  `SetGeoAnchor()` calls, `SPH_MATCH_xxx` constants, and `SPH_SORT_EXPR`
  sorting mode from APIs
* removed legacy `spelldump` utility
* removed unused `.sha` index files
* removed extraneous "no extra index definitions" warning

Major fixes:

* fixed 9+ crashes caused by certain complex (and usually rare) conditions
  and/or settings combinations
* fixed 2 crashes caused by broken index data (in vrows and dictionaries)
* fixed plain index locking issues on Windows
* fixed JSON fields handling vs strings and NULLs (no more corner cases like
  NULL objects passing a test for json.col=0)
* fixed matches loss issue in positional (phrase/order/sentence etc) operators
  and modifiers under certain conditions
* fixed hashing-related hangups under certain (rather rare) occasions
* fixed several type inference issues in expressions when using JSON fields

Other fixes:

* fixed that `min_best_span_pos` was sometimes off
* fixed the behavior on missing `global_idf` file
* fixed `indextool --check` vs string attributes, and vs empty JSONs
* fixed blended vs multiforms behavior (works much more predictably now)
* fixed query parser vs wildcard-only tokens
* fixed that MySQL 8.0+ clients failed to connect
* fixed occasional semaphore races on startup
* fixed `OPTIMIZE` vs `UPDATE` race; `UPDATE` can now fail with a timeout
* fixed `indexer --merge --rotate` vs kbatches
* fixed occasional rotation-related deadlock
* fixed a few memory leaks

### Version 3.0.3, 30 mar 2018

* added `BITCOUNT()` function and bitwise-NOT operator, eg `SELECT BITCOUNT(~3)`
* made `searchd` config section completely optional
* improved `min_infix_len` behavior, required 2-char minimum is now enforced
* improved docs, added a few sections
* fixed binary builds performance
* fixed several crashes (related to docstore, snippets, threading,
  `json_packed_keys` in RT)
* fixed docid-less SQL sources, forbidden those for now (docid still required)
* fixed int-vs-float precision issues in expressions in certain cases
* fixed `uptime` counter in `SHOW STATUS`
* fixed query cache vs `PACKEDFACTORS()`

### Version 3.0.2, 25 feb 2018

* added `full_field_hit` ranking factor
* added `bm15` ranking factor name (legacy `bm25` name misleading,
  to be removed)
* optimized RT inserts significantly (upto 2-6x on certain benchmarks vs 3.0.1)
* optimized `exact_field_hit` ranking factor, impact now negligible
  (approx 2-4%)
* improved `indexer` output, less visual noise
* improved `searchd --safetrace` option, now skips `addr2line` to avoid
  occasional freezes
* improved `indexer` MySQL driver lookup, now also checking for `libmariadb.so`
* fixed rare occasional `searchd` crash caused by attribute indexes
* fixed `indexer` crash on missing SQL drivers, and improved error reporting
* fixed `searchd` crash on multi-index searches with docstore
* fixed that expression parser failed on field-shadowing attributes in
  `BM25F()` weights map
* fixed that `ALTER` failed on field-shadowing attributes vs
  `index_field_lengths` case
* fixed junk data writes (seemingly harmless but anyway) in certain cases
* fixed rare occasional `searchd` startup failures (threading related)

### Version 3.0.1, 18 dec 2017

* first public release of 3.x branch


Changes since 2.x
------------------

> WIP: the biggest change to rule them all is yet to come. The all new, fully
RT index format is still in progress, and not yet available. Do not worry, ETL
via `indexer` will *not* be going anywhere. Moreover, despite being fully and
truly RT, the new format is actually already *faster* at batch indexing.

The biggest changes since Sphinx 2.x are:

  * added DocStore, document storage
    * original document contents can now be stored into the index
    * disk based storage, RAM footprint should be minimal
    * goodbye, *having* to query Another Database to fetch data
  * added new attributes storage format
    * arbitrary updates support (including MVA and JSON)
    * goodbye, sudden size limits
  * added attribute indexes, with JSON support
    * ... `WHERE gid=123` queries can now utilize A-indexes
    * ... `WHERE MATCH('hello') AND gid=123` queries can now efficiently
      intersect FT-indexes and A-indexes
    * goodbye, *having* to use fake keywords
  * added compressed JSON keys
  * switched to rowids internally, and forced all docids to 64 bits

Another two big changes that are already available but still in pre-alpha are:

  * added "zero config" mode (`./sphinxdata` folder)
  * added index replication

The additional smaller niceties are:

  * added always-on support for xmlpipe, snowball stemmers, and re2
    (regexp filters)
  * added `blend_mode=prefix_tokens`, and enabled empty `blend_mode`
  * added `kbatch_source` directive, to auto-generate k-batches from source
    docids (in addition to explicit queries)
  * added `SHOW OPTIMIZE STATUS` statement
  * added `exact_field_hit` ranking factor
  * added `123.45f` value syntax in JSON, optimized support for float32 vectors,
    and `FVEC()` and `DOT()` functions
  * added preindexed data in document storage to speed up `SNIPPETS()`
    (via `hl_fields` directive)
  * changed field weights, zero and negative weights are now allowed
  * changed stemming, keywords with digits are now excluded

A bunch of legacy things were removed:

  * removed `dict`, `docinfo`, `infix_fields`, `prefix_fields` directives
  * removed `attr_flush_period`, `hit_format`, `hitless_words`, `inplace_XXX`,
    `max_substring_len`, `mva_updates_pool`, `phrase_boundary_XXX`,
    `sql_joined_field`, `subtree_XXX` directives
  * removed legacy id32 and id64 modes, mysqlSE plugin, and
    `indexer --keep-attrs` switch

And last but not least, the new config directives to play with are:

  * `docstore_type`, `docstore_block`, `docstore_comp`, `docstore_cache_size`
    (per-index) let you generally configure DocStore
  * `stored_fields`, `stored_only_fields`, `hl_fields` (per-index) let you
    configure what to put in DocStore
  * `kbatch`, `kbatch_source` (per-index) update the legacy k-lists-related
    directives
  * `updates_pool` (per-index) sets vrow file growth step
  * `json_packed_keys` (`common` section) enables the JSON keys compression
  * `binlog_flush_mode` (`searchd` section) changes the per-op flushing mode
    (0=none, 1=fsync, 2=fwrite)

Quick update caveats:

  * if you were using `sql_query_killlist` then you now *must* explicitly
    specify `kbatch` and list all the indexes that the k-batch should be
    applied to:

```sql
sql_query_killlist = SELECT deleted_id FROM my_deletes_log
kbatch = main

# or perhaps:
# kbatch = shard1,shard2,shard3,shard4
```


Copyrights
-----------

This documentation is copyright (c) 2017-2018, Andrew Aksyonoff. The author
hereby grants you the right to redistribute it in a verbatim form, along with
the respective copy of Sphinx it came bundled with. All other rights are
reserved.
