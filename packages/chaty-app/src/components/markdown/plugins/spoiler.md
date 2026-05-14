This is a **remark plugin** that parses **spoiler tags** `||like this||` in markdown
and converts them into a structured AST format.

## What is a Spoiler?

In chat/markdown apps, text between `||` is hidden until clicked:

```
Normal text ||spoiler content|| more text
```

Becomes:

- "Normal text "
- `<spoiler>spoiler content</spoiler>`
- " more text"

## The Core Problem

Spoilers can span multiple parts:

- `||start` → closing `end||` could be **later in the same text** or **in a different child element**
- Complex cases: `||spoiler with ||nested|| weirdness||`

## Key Variables

| Variable | Purpose |
|----------|---------|
| `searchingForEnd` | Index where an **unclosed** spoiler started (-1 = not searching) |
| `spoilerContent` | Accumulates content between start `||` and end `||` |

## How `split("||")` Works

```javascript
"Hello ||world||!".split("||")
// Result: ["Hello ", "world", "!"]
// Pattern: text, spoiler, text

"||start and ||middle|| end".split("||")
// Result: ["", "start and ", "middle", " end"]
// Pattern: empty, spoiler, spoiler? wait what?
```

## The SpillOver Concept

```javascript
const components = child.value.split("||");
// Example 1: "a ||b|| c" → ["a ", "b", " c"] (3 parts → odd)
// Example 2: "a ||b" → ["a ", "b"] (2 parts → even)
```

**Even number of pipes** = unclosed spoiler (started but not ended)
**Odd number** = all spoilers are closed

```javascript
const spillOver = components.length % 2 === 1;
// true = last component is NOT inside a spoiler
// false = last component IS inside a spoiler (unclosed)
```

## Step-by-Step Example

### Example 1: Simple spoiler

Text: `"Hello ||world||!"`

```javascript
components = ["Hello ", "world", "!"]
components.length = 3 (odd → spillOver = true)
innerElements = (3 - 1) / 2 = 1 spoiler
```

Processing:

```javascript
child.value = components.shift() // child.value = "Hello "
components now: ["world", "!"]

// Create spoiler (j=0)
node.children.splice(i+1, 0, 
  { type: "spoiler", children: [{ type: "text", value: "world" }] },
  { type: "text", value: "!" }
)
```

Result AST:

```
children: [
  { type: "text", value: "Hello " },
  { type: "spoiler", children: [{ type: "text", value: "world" }] },
  { type: "text", value: "!" }
]
```

### Example 2: Unclosed spoiler

Text: `"Start ||this is hidden"`

```javascript
components = ["Start ", "this is hidden"]
components.length = 2 (even → spillOver = false)
innerElements = (2 - 0) / 2 = 0
spillOver = false → we're still inside a spoiler!
searchingForEnd = i + 1
spoilerContent = [{ type: "text", value: "this is hidden" }]
```

Now waiting for the closing `||` in a future node.

### Example 3: Multi-part spoiler (spans text nodes)

Input:

```
Node 1: "Start ||hidden"
Node 2: " content continues|| end"
```

**Processing Node 1:**

```javascript
components = ["Start ", "hidden"]
// Even length → unclosed
searchingForEnd = i + 1  // marks position where spoiler started
spoilerContent = [{ type: "text", value: "hidden" }]
```

**Processing Node 2:**

```javascript
components = [" content continues", " end"]  // split " content continues|| end"
// Even length again? Wait, we need to handle closing!

if (searchingForEnd !== -1) {
  // Get all elements between start and here
  const elements = node.children.splice(searchingForEnd, i - searchingForEnd);
  
  // Create combined spoiler with accumulated content
  node.children.splice(i, 0, {
    type: "spoiler",
    children: [
      ...spoilerContent,  // from previous node
      ...elements,         // any elements in between
      { type: "text", value: components.shift() }  // " content continues"
    ]
  });
  
  searchingForEnd = -1;  // reset
  spoilerContent = [];
}
```

## The Complete Flow Diagram

```
Text: "Hello ||spoiler||!"

Step 1: split("||") → ["Hello ", "spoiler", "!"]
Step 2: child.value = "Hello "
Step 3: Create spoiler node with "spoiler"
Step 4: Add text node with "!"

Result: Hello [SPOILER] !

Text: "||multipart||"

Step 1: split("||") → ["", "multipart", ""]
Step 2: child.value = "" (empty)
Step 3: Create spoiler
Step 4: Add empty text node

Text: "||unclosed"
Step 1: split("||") → ["", "unclosed"]
Step 2: child.value = ""
Step 3: No closing yet → store in spoilerContent
Step 4: Wait for next node with closing ||
```

## Why This Complexity?

Simple regex replace won't work because:

1. Spoilers can span multiple AST nodes
2. Content between `||` and `||` can contain other markdown
3. Need to preserve the AST structure
4. Support for nested spoilers is handled by this algorithm

The plugin essentially implements a **state machine** that tracks whether we're
inside a spoiler and accumulates content until finding the closing marker.

---
---
---
**Concrete examples** showing exactly what each variable contains at each step.

## Example 1: Simple spoiler in one text node

**Input:** `"Hello ||world||!"`

### Initial state

```javascript
node.children = [
  { type: "text", value: "Hello ||world||!" }
]
```

### Iteration i=0

```javascript
child = { type: "text", value: "Hello ||world||!" }
searchingForEnd = -1  // not currently in a spoiler
spoilerContent = []
```

### Split the value

```javascript
components = "Hello ||world||!".split("||")
// Result: components = ["Hello ", "world", "!"]
// Index:                   0        1       2
```

### Since searchingForEnd === -1 (not in spoiler)

```javascript
components.length = 3  // odd number
spillOver = true  // (3 % 2 === 1)
innerElements = (3 - 1) / 2 = 1  // one complete spoiler
```

### Extract first text component

```javascript
child.value = components.shift()  // removes "Hello "
// child.value = "Hello "
// components now = ["world", "!"]
```

### Create the spoiler (j=0 loop)

```javascript
// j=0 only
components.shift()  // removes "world"
// components now = ["!"]

node.children.splice(i + 1, 0,
  { type: "spoiler", children: [{ type: "text", value: "world" }] },
  { type: "text", value: "!" }
)
// i += 2 → i = 2
```

### After loop

```javascript
// Since spillOver = true, no unclosed spoiler
searchingForEnd remains -1
spoilerContent stays []
```

### Final AST

```javascript
node.children = [
  { type: "text", value: "Hello " },
  { type: "spoiler", children: [{ type: "text", value: "world" }] },
  { type: "text", value: "!" }
]
```

---

## Example 2: Multiple spoilers

**Input:** `"a ||b|| c ||d|| e"`

### Initial

```javascript
components = ["a ", "b", " c ", "d", " e"]
// Index:      0    1     2     3    4
components.length = 5 (odd → spillOver = true)
innerElements = (5 - 1) / 2 = 2 spoilers
```

### After first text extraction

```javascript
child.value = components.shift()  // "a "
components = ["b", " c ", "d", " e"]
```

### Loop j=0 (first spoiler)

```javascript
components.shift()  // "b"
components = [" c ", "d", " e"]

// Insert
node.children.splice(1, 0,
  { type: "spoiler", children: [{ type: "text", value: "b" }] },
  { type: "text", value: " c " }
)
// i += 2 → i = 2
```

### Loop j=1 (second spoiler)

```javascript
components.shift()  // "d"
components = [" e"]

node.children.splice(3, 0,
  { type: "spoiler", children: [{ type: "text", value: "d" }] },
  { type: "text", value: " e" }
)
// i += 2 → i = 4
```

### Final result

```javascript
[
  { type: "text", value: "a " },
  { type: "spoiler", children: [{ value: "b" }] },
  { type: "text", value: " c " },
  { type: "spoiler", children: [{ value: "d" }] },
  { type: "text", value: " e" }
]
```

---

## Example 3: Unclosed spoiler (spans multiple nodes)

**Input:** Two separate text nodes

```
Node 0: "Start ||hidden"
Node 1: " content ends|| finish"
```

### Processing Node 0 (i=0)

```javascript
child = { type: "text", value: "Start ||hidden" }
searchingForEnd = -1

components = ["Start ", "hidden"]
// length = 2 (even → spillOver = false)
innerElements = 0
```

```javascript
child.value = components.shift()  // "Start "
components = ["hidden"]

// No innerElements loop (innerElements = 0)

// Since spillOver = false, we're STILL INSIDE a spoiler!
searchingForEnd = i + 1  // searchingForEnd = 1
spoilerContent = [{ type: "text", value: "hidden" }]
```

### Processing Node 1 (i=1)

```javascript
child = { type: "text", value: " content ends|| finish" }

// searchingForEnd !== -1 (it's 1), so we're closing a spoiler

components = [" content ends", " finish"]
```

### Extract elements between start and here

```javascript
const elements = node.children.splice(1, 1 - 1)
// elements = [] (nothing between)
```

### Create combined spoiler

```javascript
node.children.splice(1, 0, {
  type: "spoiler",
  children: [
    ...spoilerContent,  // [{ type: "text", value: "hidden" }]
    ...elements,        // []
    { type: "text", value: components.shift() }  // " content ends"
  ]
})
// components now = [" finish"]
```

### Reset state

```javascript
searchingForEnd = -1
spoilerContent = []
```

### Process remaining in current node

```javascript
child.value = components.shift()  // " finish"
// components = []
// No more processing
```

### Final AST

```javascript
node.children = [
  { type: "text", value: "Start " },
  { type: "spoiler", children: [
      { type: "text", value: "hidden" },
      { type: "text", value: " content ends" }
    ]
  },
  { type: "text", value: " finish" }
]
```

---

## Example 4: Nested spoilers

**Input:** `"||outer ||inner|| outer||"`

### Split

```javascript
components = ["", "outer ", "inner", " outer", ""]
// Index:     0     1        2       3       4
// length = 5 (odd → spillOver = true)
innerElements = (5 - 1) / 2 = 2
```

### Extract first text

```javascript
child.value = components.shift()  // ""
components = ["outer ", "inner", " outer", ""]
```

### j=0 (first inner spoiler)

```javascript
components.shift()  // "outer " → becomes spoiler text? Wait
// Actually this creates a spoiler WITHIN the outer spoiler
```

The algorithm creates:

```javascript
[
  { type: "text", value: "" },
  { type: "spoiler", children: [{ type: "text", value: "outer " }] },  // outer start
  { type: "text", value: "inner" },  // text between spoilers
  { type: "spoiler", children: [{ type: "text", value: " outer" }] }, // inner spoiler
  { type: "text", value: "" }
]
```

This creates **adjacent spoilers**, not truly nested. True nesting requires different parsing.

---

## Example 5: Empty spoiler

**Input:** `"hello |||| world"`

### Split

```javascript
components = ["hello ", "", "", " world"]
// Index:      0       1   2    3
// length = 4 (even → spillOver = false)
innerElements = (4 - 0) / 2 = 2
```

### Process

```javascript
child.value = "hello "

// j=0
components.shift()  // "" (empty)
Insert spoiler with empty content
components.shift()  // "" (next text)
// i += 2

// j=1
components.shift()  // "" (empty)
Insert another empty spoiler
components.shift()  // " world"
```

### Result

```javascript
[
  { type: "text", value: "hello " },
  { type: "spoiler", children: [{ type: "text", value: "" }] },
  { type: "text", value: "" },
  { type: "spoiler", children: [{ type: "text", value: "" }] },
  { type: "text", value: " world" }
]
```

---

## Variable Summary Table

| Situation | `components.length` | `spillOver` | `innerElements` | `searchingForEnd` after |
|-----------|---------------------|-------------|-----------------|------------------------|
| `"a ||b|| c"` | 3 (odd) | true | 1 | -1 |
| `"a ||b"` | 2 (even) | false | 0 | i+1 |
| `"a ||b|| c ||d"` | 4 (even) | false | 2 | i+1 |
| `"||a"` | 2 (even) | false | 0 | i+1 |
| `"a||"` | 2 (even) | false | 0 | i+1 |
| `"a ||b|| c ||d|| e"` | 5 (odd) | true | 2 | -1 |

This algorithm efficiently handles single-node, multi-node, and edge cases of
spoiler parsing in markdown ASTs.
