Under the hood
==============

``elm-coverage`` consists of a fair number of moving parts. This is my attempt
to document how those parts work together, and which part is responsible for
what.

The runner
----------

The *runner* or *supervisor* is the main entrypoint and is responsible for
glueing all the pieces together to a coherent whole.

Its responsibilities are roughly these:

- Parse the commandline arguments
- Traverse the source-path, looking for Elm-files
- Create a backup of all of these and instrument the originals in-place using
  ``elm-instrument``
- Modify ``tests/elm-package.json`` to know where the ``Coverage`` module is
- Run ``elm-test``
- Restore all the backups (sources and ``tests/elm-package.json``
- Instruct the analyzer to analyze the generated coverage files and create a
  report
- Optionally, try to open the generated report in the user's browser

Instrumenting with ``elm-instrument``
-------------------------------------

Instrumentation is handled by an AST->AST transformation implemented in a fork
of ``elm-format`` - since that project happens to have the highest quality
parser+writer in the ecosystem, battle-tested on hundreds of projects.

The AST is traversed and modified while also keeping track of a few bit of
information. Certain expressions (specifically the bodies of declarations,
let-declarations, lambda's, if/else branches and case..of branches) are
instrumented with a ``let _ = Coverage.track <moduleIdentifier>
<expressionIdentifier> in`` expression. Whenever instrumentation is added, some
information about the instrumented expression is tracked.


+---------------+----------+----------+----------+
|               |Source    |Cyclomatic|Name      |
|               |location  |complexity|          |
+===============+==========+==========+==========+
|**Declaration**|x         |x         |x         |
+---------------+----------+----------+----------+
|**Let          |x         |x         |          |
|declaration**  |          |          |          |
+---------------+----------+----------+----------+
|**Lambda body**|x         |x         |          |
+---------------+----------+----------+----------+
|**if/else      |x         |          |          |
|branch**       |          |          |          |
+---------------+----------+----------+----------+
|**case..of     |x         |          |          |
|branch**       |          |          |          |
+---------------+----------+----------+----------+

The recorded information is accumulated for all instrumented modules and
persisted to ``.coverage/info.json``.

The ``Coverage`` module
-----------------------

The ``Coverage`` module, which is "linked in" by the runner, exposes a single
function::

    Coverage.track : String -> Int -> Never -> a

It is passed the module-name and an offset in the total list of track
expressions of a module, and returns a function that can never be called. When
evaluated, the internal coverage-data is updated; incrementing a simple counter
based on the module-name and offset.

When the active process signals `elm-test` that all of its tests have finished
running, the coverage data is persisted to disk in a ``coverage-{{pid}}.json``
file.

The analyzer
------------

The analyzer is a thin wrapper around an Elm module. The wrapper reads in the
``info.json`` file created by the instrumenter, all the coverage files created
by the ``elm-test`` run, and all the sources of the referenced files. Once all
the data is read, it is bundled up and sent off to an Elm module for further
processing.

The Elm module parses all that data and creates the HTML report, returning the
generated report as a String over a port.
