'use strict';

const _excluded = ["block", "list", "listItem", "marks", "types"],
  _excluded2 = ["listItem"],
  _excluded3 = ["_key"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
Object.defineProperty(exports, '__esModule', {
  value: true
});
var toolkit = require('@portabletext/toolkit');
var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
function mergeComponents(parent, overrides) {
  const {
      block,
      list,
      listItem,
      marks,
      types
    } = overrides,
    rest = _objectWithoutProperties(overrides, _excluded);
  return _objectSpread(_objectSpread({}, parent), {}, {
    block: mergeDeeply(parent, overrides, "block"),
    list: mergeDeeply(parent, overrides, "list"),
    listItem: mergeDeeply(parent, overrides, "listItem"),
    marks: mergeDeeply(parent, overrides, "marks"),
    types: mergeDeeply(parent, overrides, "types")
  }, rest);
}
function mergeDeeply(parent, overrides, key) {
  const override = overrides[key];
  const parentVal = parent[key];
  if (typeof override === "function") {
    return override;
  }
  if (override && typeof parentVal === "function") {
    return override;
  }
  if (override) {
    return _objectSpread(_objectSpread({}, parentVal), override);
  }
  return parentVal;
}
const link = _ref => {
  let {
    children,
    value
  } = _ref;
  return /* @__PURE__ */jsxRuntime.jsx("a", {
    href: value == null ? void 0 : value.href,
    children
  });
};
const underlineStyle = {
  textDecoration: "underline"
};
const defaultMarks = {
  em: _ref2 => {
    let {
      children
    } = _ref2;
    return /* @__PURE__ */jsxRuntime.jsx("em", {
      children
    });
  },
  strong: _ref3 => {
    let {
      children
    } = _ref3;
    return /* @__PURE__ */jsxRuntime.jsx("strong", {
      children
    });
  },
  code: _ref4 => {
    let {
      children
    } = _ref4;
    return /* @__PURE__ */jsxRuntime.jsx("code", {
      children
    });
  },
  underline: _ref5 => {
    let {
      children
    } = _ref5;
    return /* @__PURE__ */jsxRuntime.jsx("span", {
      style: underlineStyle,
      children
    });
  },
  "strike-through": _ref6 => {
    let {
      children
    } = _ref6;
    return /* @__PURE__ */jsxRuntime.jsx("del", {
      children
    });
  },
  link
};
const defaultLists = {
  number: _ref7 => {
    let {
      children
    } = _ref7;
    return /* @__PURE__ */jsxRuntime.jsx("ol", {
      children
    });
  },
  bullet: _ref8 => {
    let {
      children
    } = _ref8;
    return /* @__PURE__ */jsxRuntime.jsx("ul", {
      children
    });
  }
};
const DefaultListItem = _ref9 => {
  let {
    children
  } = _ref9;
  return /* @__PURE__ */jsxRuntime.jsx("li", {
    children
  });
};
const getTemplate = (type, prop) => "[@portabletext/react] Unknown ".concat(type, ", specify a component for it in the `components.").concat(prop, "` prop");
const unknownTypeWarning = typeName => getTemplate("block type \"".concat(typeName, "\""), "types");
const unknownMarkWarning = markType => getTemplate("mark type \"".concat(markType, "\""), "marks");
const unknownBlockStyleWarning = blockStyle => getTemplate("block style \"".concat(blockStyle, "\""), "block");
const unknownListStyleWarning = listStyle => getTemplate("list style \"".concat(listStyle, "\""), "list");
const unknownListItemStyleWarning = listStyle => getTemplate("list item style \"".concat(listStyle, "\""), "listItem");
function printWarning(message) {
  console.warn(message);
}
const hidden = {
  display: "none"
};
const DefaultUnknownType = _ref10 => {
  let {
    value,
    isInline
  } = _ref10;
  const warning = unknownTypeWarning(value._type);
  return isInline ? /* @__PURE__ */jsxRuntime.jsx("span", {
    style: hidden,
    children: warning
  }) : /* @__PURE__ */jsxRuntime.jsx("div", {
    style: hidden,
    children: warning
  });
};
const DefaultUnknownMark = _ref11 => {
  let {
    markType,
    children
  } = _ref11;
  return /* @__PURE__ */jsxRuntime.jsx("span", {
    className: "unknown__pt__mark__".concat(markType),
    children
  });
};
const DefaultUnknownBlockStyle = _ref12 => {
  let {
    children
  } = _ref12;
  return /* @__PURE__ */jsxRuntime.jsx("p", {
    children
  });
};
const DefaultUnknownList = _ref13 => {
  let {
    children
  } = _ref13;
  return /* @__PURE__ */jsxRuntime.jsx("ul", {
    children
  });
};
const DefaultUnknownListItem = _ref14 => {
  let {
    children
  } = _ref14;
  return /* @__PURE__ */jsxRuntime.jsx("li", {
    children
  });
};
const DefaultHardBreak = () => /* @__PURE__ */jsxRuntime.jsx("br", {});
const defaultBlockStyles = {
  normal: _ref15 => {
    let {
      children
    } = _ref15;
    return /* @__PURE__ */jsxRuntime.jsx("p", {
      children
    });
  },
  blockquote: _ref16 => {
    let {
      children
    } = _ref16;
    return /* @__PURE__ */jsxRuntime.jsx("blockquote", {
      children
    });
  },
  h1: _ref17 => {
    let {
      children
    } = _ref17;
    return /* @__PURE__ */jsxRuntime.jsx("h1", {
      children
    });
  },
  h2: _ref18 => {
    let {
      children
    } = _ref18;
    return /* @__PURE__ */jsxRuntime.jsx("h2", {
      children
    });
  },
  h3: _ref19 => {
    let {
      children
    } = _ref19;
    return /* @__PURE__ */jsxRuntime.jsx("h3", {
      children
    });
  },
  h4: _ref20 => {
    let {
      children
    } = _ref20;
    return /* @__PURE__ */jsxRuntime.jsx("h4", {
      children
    });
  },
  h5: _ref21 => {
    let {
      children
    } = _ref21;
    return /* @__PURE__ */jsxRuntime.jsx("h5", {
      children
    });
  },
  h6: _ref22 => {
    let {
      children
    } = _ref22;
    return /* @__PURE__ */jsxRuntime.jsx("h6", {
      children
    });
  }
};
const defaultComponents = {
  types: {},
  block: defaultBlockStyles,
  marks: defaultMarks,
  list: defaultLists,
  listItem: DefaultListItem,
  hardBreak: DefaultHardBreak,
  unknownType: DefaultUnknownType,
  unknownMark: DefaultUnknownMark,
  unknownList: DefaultUnknownList,
  unknownListItem: DefaultUnknownListItem,
  unknownBlockStyle: DefaultUnknownBlockStyle
};
function PortableText(_ref23) {
  let {
    value: input,
    components: componentOverrides,
    listNestingMode,
    onMissingComponent: missingComponentHandler = printWarning
  } = _ref23;
  const handleMissingComponent = missingComponentHandler || noop;
  const blocks = Array.isArray(input) ? input : [input];
  const nested = toolkit.nestLists(blocks, listNestingMode || toolkit.LIST_NEST_MODE_HTML);
  const components = react.useMemo(() => {
    return componentOverrides ? mergeComponents(defaultComponents, componentOverrides) : defaultComponents;
  }, [componentOverrides]);
  const renderNode = react.useMemo(() => getNodeRenderer(components, handleMissingComponent), [components, handleMissingComponent]);
  const rendered = nested.map((node, index) => renderNode({
    node,
    index,
    isInline: false,
    renderNode
  }));
  return /* @__PURE__ */jsxRuntime.jsx(jsxRuntime.Fragment, {
    children: rendered
  });
}
const getNodeRenderer = (components, handleMissingComponent) => {
  function renderNode(options) {
    const {
      node,
      index,
      isInline
    } = options;
    const key = node._key || "node-".concat(index);
    if (toolkit.isPortableTextToolkitList(node)) {
      return renderList(node, index, key);
    }
    if (toolkit.isPortableTextListItemBlock(node)) {
      return renderListItem(node, index, key);
    }
    if (toolkit.isPortableTextToolkitSpan(node)) {
      return renderSpan(node, index, key);
    }
    if (toolkit.isPortableTextBlock(node)) {
      return renderBlock(node, index, key, isInline);
    }
    if (toolkit.isPortableTextToolkitTextNode(node)) {
      return renderText(node, key);
    }
    return renderCustomBlock(node, index, key, isInline);
  }
  function renderListItem(node, index, key) {
    const tree = serializeBlock({
      node,
      index,
      isInline: false,
      renderNode
    });
    const renderer = components.listItem;
    const handler = typeof renderer === "function" ? renderer : renderer[node.listItem];
    const Li = handler || components.unknownListItem;
    if (Li === components.unknownListItem) {
      const style = node.listItem || "bullet";
      handleMissingComponent(unknownListItemStyleWarning(style), {
        type: style,
        nodeType: "listItemStyle"
      });
    }
    let children = tree.children;
    if (node.style && node.style !== "normal") {
      const {
          listItem
        } = node,
        blockNode = _objectWithoutProperties(node, _excluded2);
      children = renderNode({
        node: blockNode,
        index,
        isInline: false,
        renderNode
      });
    }
    return /* @__PURE__ */jsxRuntime.jsx(Li, {
      value: node,
      index,
      isInline: false,
      renderNode,
      children
    }, key);
  }
  function renderList(node, index, key) {
    const children = node.children.map((child, childIndex) => renderNode({
      node: child._key ? child : _objectSpread(_objectSpread({}, child), {}, {
        _key: "li-".concat(index, "-").concat(childIndex)
      }),
      index,
      isInline: false,
      renderNode
    }));
    const component = components.list;
    const handler = typeof component === "function" ? component : component[node.listItem];
    const List = handler || components.unknownList;
    if (List === components.unknownList) {
      const style = node.listItem || "bullet";
      handleMissingComponent(unknownListStyleWarning(style), {
        nodeType: "listStyle",
        type: style
      });
    }
    return /* @__PURE__ */jsxRuntime.jsx(List, {
      value: node,
      index,
      isInline: false,
      renderNode,
      children
    }, key);
  }
  function renderSpan(node, _index, key) {
    const {
      markDef,
      markType,
      markKey
    } = node;
    const Span = components.marks[markType] || components.unknownMark;
    const children = node.children.map((child, childIndex) => renderNode({
      node: child,
      index: childIndex,
      isInline: true,
      renderNode
    }));
    if (Span === components.unknownMark) {
      handleMissingComponent(unknownMarkWarning(markType), {
        nodeType: "mark",
        type: markType
      });
    }
    return /* @__PURE__ */jsxRuntime.jsx(Span, {
      text: toolkit.spanToPlainText(node),
      value: markDef,
      markType,
      markKey,
      renderNode,
      children
    }, key);
  }
  function renderBlock(node, index, key, isInline) {
    const _serializeBlock = serializeBlock({
        node,
        index,
        isInline,
        renderNode
      }),
      {
        _key
      } = _serializeBlock,
      props = _objectWithoutProperties(_serializeBlock, _excluded3);
    const style = props.node.style || "normal";
    const handler = typeof components.block === "function" ? components.block : components.block[style];
    const Block = handler || components.unknownBlockStyle;
    if (Block === components.unknownBlockStyle) {
      handleMissingComponent(unknownBlockStyleWarning(style), {
        nodeType: "blockStyle",
        type: style
      });
    }
    return /* @__PURE__ */jsxRuntime.jsx(Block, _objectSpread(_objectSpread({}, props), {}, {
      value: props.node,
      renderNode
    }), key);
  }
  function renderText(node, key) {
    if (node.text === "\n") {
      const HardBreak = components.hardBreak;
      return HardBreak ? /* @__PURE__ */jsxRuntime.jsx(HardBreak, {}, key) : "\n";
    }
    return node.text;
  }
  function renderCustomBlock(node, index, key, isInline) {
    const Node = components.types[node._type];
    const nodeOptions = {
      value: node,
      isInline,
      index,
      renderNode
    };
    if (Node) {
      return /* @__PURE__ */jsxRuntime.jsx(Node, _objectSpread({}, nodeOptions), key);
    }
    handleMissingComponent(unknownTypeWarning(node._type), {
      nodeType: "block",
      type: node._type
    });
    const UnknownType = components.unknownType;
    return /* @__PURE__ */jsxRuntime.jsx(UnknownType, _objectSpread({}, nodeOptions), key);
  }
  return renderNode;
};
function serializeBlock(options) {
  const {
    node,
    index,
    isInline,
    renderNode
  } = options;
  const tree = toolkit.buildMarksTree(node);
  const children = tree.map((child, i) => renderNode({
    node: child,
    isInline: true,
    index: i,
    renderNode
  }));
  return {
    _key: node._key || "block-".concat(index),
    children,
    index,
    isInline,
    node
  };
}
function noop() {}
Object.defineProperty(exports, 'toPlainText', {
  enumerable: true,
  get: function () {
    return toolkit.toPlainText;
  }
});
exports.PortableText = PortableText;
exports.defaultComponents = defaultComponents;
exports.mergeComponents = mergeComponents;
//# sourceMappingURL=react-portable-text.cjs.map
