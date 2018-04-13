Reports
=======

*TODO*: Give examples and information.

Cyclomatic Complexity
---------------------

*Cyclomatic complexity*  gives an indication of how complex a piece of code is.
Essentially, it counts the number of paths through code. 

The goal of including complexity information is to help prioritizing which
functions to write tests for. A function (or module) with a very high cyclomatic
complexity and low test-coverage is a good place to start testing.

Expression complexity
~~~~~~~~~~~~~~~~~~~~~

There are only two expressions that - by themselves - increment cyclomatic
complexity: ``if <cond> then`` and branches in ``case <expr> of``.

Let's look at some examples::

    if a == 12 then
        "It was twelve!"
    else
        "It wasn't twelve..."

The above example has a cyclomatic complexity of **1**, as there is 1 extra flow
through the code added. Similarly::

    if a == 6 then
        "It was six."
    else if a == 12 then
        "It was twelve!"
    else
        "It was just a random number..."

This expression has a cyclomatic complexity of **2**.

For ``case <expr> of``, similar rules apply. A single branch (which can either
be a catch-all or a destructuring) does not increase complexity; as all pattern
matches in Elm must be exhaustive, we know that this branch was the only option
and as such, does not introduce a decision point.

As such, and easy way to compute the complexity of an expression is to count the
number of ``if`` branches, add the number of ``case`` branches and subtract the
number of ``case <expr> of`` expressions.

Declaration complexity
~~~~~~~~~~~~~~~~~~~~~~

The total complexity of a top-level declaration is simply the total complexity
of its body + 1. Note that let-bindings do not - by themselves - increase the
complexity of a declaration. If they contain ``case <expr> of`` expressions of
``if <cond> then`` expressions, however, they will count towards the complexity
of the surrounding declaration. The same rule is applied to anonymous functions.

Module complexity
~~~~~~~~~~~~~~~~~

The complexity of a module is calculated by taking the sum of the calculated
complexity of each declaration, subtracting the number of declarations and
adding one.

As such, no matter how many declarations are defined in a module, if they all
have complexity **1**, the module will also have complexity **1**. If there is
one declaration with complexity **2** and one declaration with complexity **3**,
the total complexity of that module will be **4**.
