## Full Function with Example Values

### Example Input: Two text nodes with unclosed spoiler

```javascript
node.children = [
  { type: "text", value: "Start ||hidden" },
  { type: "text", value: " content|| finish" }
]
```

---

### INITIAL STATE

```javascript
let searchingForEnd = -1
let spoilerContent = []
```

---

## ITERATION 1 (i = 0)

```javascript
child = { type: "text", value: "Start ||hidden" }
```

### Split the text

```javascript
const components = child.value.split("||")
// components = ["Start ", "hidden"]
//               ^^^^^^^   ^^^^^^^
//               text      spoiler content
```

### Check for closing spoiler

```javascript
if (searchingForEnd !== -1)  // searchingForEnd = -1, so SKIP
```

### Extract first text component

```javascript
child.value = components.shift()
// child.value = "Start "
// components = ["hidden"]
```

### Calculate spoiler counts

```javascript
const spillOver = components.length % 2 === 1
// components.length = 1, 1 % 2 = 1, so spillOver = true

const innerElements = (components.length - (spillOver ? 1 : 0)) / 2
// innerElements = (1 - 1) / 2 = 0
```

### Create inner spoilers (skip since innerElements = 0)

### Handle unclosed spoiler

```javascript
if (spillOver) {  // true
  searchingForEnd = i + 1
  // searchingForEnd = 0 + 1 = 1
  
  spoilerContent.push({
    type: "text",
    value: components.pop()  // removes "hidden"
  })
  // spoilerContent = [{ type: "text", value: "hidden" }]
  // components = []
}
```

### AFTER ITERATION 1

```javascript
node.children = [
  { type: "text", value: "Start " },     // index 0 (modified)
  { type: "text", value: " content|| finish" }  // index 1
]
searchingForEnd = 1
spoilerContent = [{ type: "text", value: "hidden" }]
i = 1 (after loop increment)
```

---

## ITERATION 2 (i = 1)

```javascript
child = { type: "text", value: " content|| finish" }
```

### Split the text

```javascript
const components = child.value.split("||")
// components = [" content", " finish"]
//               ^^^^^^^^   ^^^^^^^^
//               text        text
```

### Handle terminating spoiler tag

```javascript
if (searchingForEnd !== -1) {  // searchingForEnd = 1, so ENTER
  
  // BEFORE SPLICE
  // node.children = [
  //   index0: { type: "text", value: "Start " },
  //   index1: { type: "text", value: " content|| finish" }
  // ]
  // searchingForEnd = 1, i = 1
  
  const elements = node.children.splice(
    searchingForEnd,     // start at index 1
    i - searchingForEnd  // delete 1 - 1 = 0 items
  )
  // elements = []  (deleted nothing)
  
  // AFTER SPLICE (same since deleteCount = 0)
  // node.children = [
  //   index0: { type: "text", value: "Start " },
  //   index1: { type: "text", value: " content|| finish" }
  // ]
  
  // Create spoiler at current position
  node.children.splice(i, 0, {
    type: "spoiler",
    children: [
      ...spoilerContent,    // [{ type: "text", value: "hidden" }]
      ...elements,          // []
      {
        type: "text",
        value: components.shift()  // removes " content"
      }
    ]
  })
  // components now = [" finish"]
  
  // AFTER INSERTION
  // node.children = [
  //   index0: { type: "text", value: "Start " },
  //   index1: { type: "spoiler", children: [
  //       { type: "text", value: "hidden" },
  //       { type: "text", value: " content" }
  //     ]
  //   },
  //   index2: { type: "text", value: " content|| finish" }
  // ]
  
  i += elements.length + 1
  // i = 1 + 0 + 1 = 2
  
  searchingForEnd = -1
  spoilerContent = []
}
```

### Continue processing current child

```javascript
// child still points to original node at index 2
child.value = components.shift()
// child.value = " finish"
// components = []
```

### Calculate spoiler counts

```javascript
const spillOver = components.length % 2 === 1
// components.length = 0, 0 % 2 = 0, so spillOver = false

const innerElements = (0 - 0) / 2 = 0
// skip spoiler creation
```

### AFTER ITERATION 2

```javascript
node.children = [
  { type: "text", value: "Start " },
  { type: "spoiler", children: [
      { type: "text", value: "hidden" },
      { type: "text", value: " content" }
    ]
  },
  { type: "text", value: " finish" }
]
```

---

## Example 2: Single node with multiple spoilers

### Input

```javascript
node.children = [
  { type: "text", value: "a ||b|| c ||d|| e" }
]
```

### INITIAL

```javascript
searchingForEnd = -1
spoilerContent = []
i = 0
```

### ITERATION 1

```javascript
components = ["a ", "b", " c ", "d", " e"]
child.value = components.shift()  // "a "
components = ["b", " c ", "d", " e"]

spillOver = false (4 % 2 = 0)
innerElements = 2

// j = 0
components.shift()  // "b"
components = [" c ", "d", " e"]
node.children.splice(1, 0,
  { type: "spoiler", children: [{ value: "b" }] },
  { type: "text", value: " c " }
)
// node.children now has 3 items
i = 2

// j = 1
components.shift()  // "d"
components = [" e"]
node.children.splice(3, 0,
  { type: "spoiler", children: [{ value: "d" }] },
  { type: "text", value: " e" }
)
i = 4
```

### FINAL

```javascript
node.children = [
  { type: "text", value: "a " },
  { type: "spoiler", children: [{ value: "b" }] },
  { type: "text", value: " c " },
  { type: "spoiler", children: [{ value: "d" }] },
  { type: "text", value: " e" }
]
```

---

## Example 3: Empty spoilers

### Input

```javascript
node.children = [
  { type: "text", value: "hello |||| world" }
]
```

### ITERATION 1

```javascript
components = ["hello ", "", "", " world"]
child.value = components.shift()  // "hello "
components = ["", "", " world"]

spillOver = false (3 % 2 = 1? Wait count carefully)
// components.length = 3 (["", "", " world"])
// 3 % 2 = 1, so spillOver = true? Let me recalc

// Actually "hello |||| world".split("||")
// Results: ["hello ", "", "", " world"]
// That's 4 items! Let me fix:

components = ["hello ", "", "", " world"]  // length = 4
child.value = "hello "
components = ["", "", " world"]  // length = 3
spillOver = true (3 % 2 = 1)
innerElements = (3 - 1) / 2 = 1

// j = 0
components.shift()  // "" (empty spoiler)
components = ["", " world"]
node.children.splice(1, 0,
  { type: "spoiler", children: [{ value: "" }] },
  { type: "text", value: "" }
)
i = 2
```

### FINAL

```javascript
node.children = [
  { type: "text", value: "hello " },
  { type: "spoiler", children: [{ value: "" }] },
  { type: "text", value: "" },
  { type: "text", value: " world" }  // remaining
]
```

---

## Variable State Summary Table

| Line/Action | `components` | `elements` | `spoilerContent` | `searchingForEnd` | `i` |
|-------------|--------------|------------|------------------|-------------------|-----|
| Start | - | - | `[]` | -1 | 0 |
| After split (node1) | `["Start ", "hidden"]` | - | `[]` | -1 | 0 |
| After shift | `["hidden"]` | - | `[]` | -1 | 0 |
| After unclosed | `[]` | - | `[{text:"hidden"}]` | 1 | 1 |
| After split (node2) | `[" content", " finish"]` | - | `[{text:"hidden"}]` | 1 | 1 |
| Before splice | `[" content", " finish"]` | `[]` | `[{text:"hidden"}]` | 1 | 1 |
| After components.shift in spoiler | `[" finish"]` | `[]` | `[{text:"hidden"}]` | -1 | 2 |
| After second shift | `[]` | `[]` | `[]` | -1 | 2 |

This shows exactly how the function transforms the AST step by step!
