Under the hood ==============

``elm-coverage`` consists of a fair number of moving parts. This is my attempt
to document how those parts work together, and which part is responsible for
what.

The runner ----------

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

Instrumenting with ``elm-instrument`` -------------------------------------

Instrumentation is handled by an AST->AST transformation implemented in a fork
of ``elm-format`` - since that project happens to have the highest quality
parser+writer in the ecosystem, battle-tested on hundreds of projects.

The transformation traverses the entire syntax tree of every module, wrapping
expressions in calls to the relevant ``Coverage.*`` function and computing
complexity along the way.

Finally, the modified body is rendered and the original file replaced. An extra
import for the ``Coverage`` module is added, and an extra top-level call to
``Coverage.init`` appended.

Expressions are annotated by wrapping them in a ``let .. in .. `` block.
Subsequent ``let`` blocks are collapsed into a single block. A reason for using
a ``let .. in ..`` approach rather than wrapping the expressions in an
``identity``\ -like function is that the compiler can do its regular tail-call
elimintation, as the final expression to be evaluated in any expression remains
the same.

The ``Coverage`` module -----------------------

The ``Coverage`` module, through the calls to it added by ``elm-instrument``,
keeps track of how many times each instrumented expression is evaluated. During
initialization, the ``Coverage`` module writes away a marker file. During
process shutdown, the coverage data is recorded in a ``.json`` file, after which
the coverage gathering is complete and a second marker file is created.

Each of these files has a similar name:

- ``coverage-{{pid}}.created`` - coverage started
- ``coverage-{{pid}}.json`` - coverage data
- ``coverage-{{pid}}.marker`` - coverage done

Internally, the ``Coverage`` module exposes a number of special purpose
function, each marking a particular type of expression. These calls all have the
same shape::

    Coverage.{{expressionType}} : String -> Int -> Never -> a

It is passed the module-name and an offset in the total list of expressions of
that same type, and returns a function that can never be called. When evaluated,
the internal coverage-data is updated; incrementing a simple counter based on
the module-name and offset.

Separately, there is also a top-level call to `Coverage.init`, in which the
module is identified and a list of all the tracked expressions is passed,
together with their locations in the original source. For some types of
expression, we also receive a name (top-level declarations) and the cyclomatic
complexity (top-level declarations, let-declarations and lambdas).

The analyzer ------------

The analyzer is a thin wrapper around an Elm module. The wrapper reads in all
the coverage files (waiting for the respective ``.marker`` file to be created).
Once all the data is aggregated, the original source files are read and the
whole shebang is sent off to the Elm module.

The Elm module, in turn, parses all that data and creates the HTML report,
returning the generated report as a String over a port.
