'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var css = '\n/**\n * FixedDataTable v0.3.0\n *\n * Copyright (c) 2015, Facebook, Inc.\n * All rights reserved.\n *\n * This source code is licensed under the BSD-style license found in the\n * LICENSE file in the root directory of this source tree. An additional grant\n * of patent rights can be found in the PATENTS file in the same directory.\n */\n\n.public_Scrollbar_main{box-sizing:border-box;outline:none;overflow:hidden;position:absolute;-webkit-transition-duration:250ms;transition-duration:250ms;-webkit-transition-timing-function:ease;transition-timing-function:ease;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.public_Scrollbar_mainVertical{bottom:0;right:0;top:0;-webkit-transition-property:background-color width;transition-property:background-color width;width:15px}.public_Scrollbar_mainVertical.Scrollbar_mainActive,.public_Scrollbar_mainVertical:hover{background-color:rgba(255,255,255,.8);width:17px}.public_Scrollbar_mainHorizontal{bottom:0;height:15px;left:0;-webkit-transition-property:background-color height;transition-property:background-color height}.public_Scrollbar_mainHorizontal.Scrollbar_mainActive,.public_Scrollbar_mainHorizontal:hover{background-color:rgba(255,255,255,.8);height:17px}.Scrollbar_mainOpaque,.Scrollbar_mainOpaque.Scrollbar_mainActive,.Scrollbar_mainOpaque:hover{background-color:#fff}.Scrollbar_face{left:0;overflow:hidden;position:absolute;z-index:1}.Scrollbar_face:after{background-color:#c2c2c2;border-radius:6px;content:\'\';display:block;position:absolute;-webkit-transition:background-color 250ms ease;transition:background-color 250ms ease}.public_Scrollbar_main:hover .Scrollbar_face:after,.Scrollbar_mainActive .Scrollbar_face:after,.Scrollbar_faceActive:after{background-color:#7d7d7d}.Scrollbar_faceHorizontal{bottom:0;left:0;top:0}.Scrollbar_faceHorizontal:after{bottom:4px;left:0;top:4px;width:100%}.Scrollbar_faceVertical{left:0;right:0;top:0}.Scrollbar_faceVertical:after{height:100%;left:4px;right:4px;top:0}.public_fixedDataTable_main{border:solid 1px #d3d3d3;box-sizing:border-box;overflow:hidden;position:relative}.public_fixedDataTable_header,.fixedDataTable_hasBottomBorder{border-bottom:solid 1px #d3d3d3}.public_fixedDataTableRow_main.fixedDataTable_hasBottomBorder{box-sizing:content-box}.public_fixedDataTable_header .public_fixedDataTableCell_main{font-weight:700}.public_fixedDataTable_header,.public_fixedDataTable_header .public_fixedDataTableCell_main{background-color:#f6f7f8;background-image:-webkit-linear-gradient(#fff,#efefef);background-image:linear-gradient(#fff,#efefef)}.public_fixedDataTable_footer .public_fixedDataTableCell_main{background-color:#f6f7f8;border-top:solid 1px #d3d3d3}.fixedDataTable_topShadow,.fixedDataTable_bottomShadow{height:4px;left:0;position:absolute;right:0;z-index:1}.fixedDataTable_topShadow{background:0 0 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAECAYAAABP2FU6AAAAF0lEQVR4AWPUkNeSBhHCjJoK2twgFisAFagCCp3pJlAAAAAASUVORK5CYII=) repeat-x}.fixedDataTable_bottomShadow{background:0 0 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAECAYAAABP2FU6AAAAHElEQVQI12MwNjZmZdAT1+Nm0JDWEGZQk1GTBgAWkwIeAEp52AAAAABJRU5ErkJggg==) repeat-x;margin-top:-4px}.fixedDataTable_rowsContainer{overflow:hidden;position:relative}.fixedDataTable_horizontalScrollbar{bottom:0;position:absolute}.fixedDataTable_horizontalScrollbar .public_Scrollbar_mainHorizontal{background:#fff}.public_fixedDataTableCell_main{background-color:#fff;border:solid 1px #d3d3d3;border-width:0 1px 0 0;box-sizing:border-box;display:block;overflow:hidden;position:absolute;white-space:normal}.public_fixedDataTableCell_lastChild{border-width:0 1px 1px 0}.public_fixedDataTableCell_highlighted{background-color:#f4f4f4}.public_fixedDataTableCell_alignRight{text-align:right}.public_fixedDataTableCell_alignCenter{text-align:center}.public_fixedDataTableCell_wrap1{display:table}.public_fixedDataTableCell_wrap2{display:table-row}.public_fixedDataTableCell_wrap3{display:table-cell;vertical-align:middle}.public_fixedDataTableCell_cellContent{padding:8px}.fixedDataTableCell_columnResizerContainer{position:absolute;right:0;width:6px;z-index:1}.fixedDataTableCell_columnResizerContainer:hover{cursor:ew-resize}.fixedDataTableCell_columnResizerContainer:hover .fixedDataTableCell_columnResizerKnob{visibility:visible}.fixedDataTableCell_columnResizerKnob{background-color:#0284ff;position:absolute;right:0;visibility:hidden;width:4px}.fixedDataTableCellGroup_cellGroup{-webkit-backface-visibility:hidden;backface-visibility:hidden;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap}.fixedDataTableCellGroup_cellGroup>.public_fixedDataTableCell_main{display:inline-block;vertical-align:top;white-space:normal}.fixedDataTableCellGroup_cellGroupWrapper{position:absolute;top:0}.fixedDataTableColumnResizerLine_mouseArea{cursor:ew-resize;position:absolute;right:-5px;width:12px}.fixedDataTableColumnResizerLine_main{border-right:1px solid #0284ff;box-sizing:border-box;position:absolute;z-index:10}.fixedDataTableColumnResizerLine_hiddenElem{display:none!important}.public_fixedDataTableRow_main{background-color:#fff;box-sizing:border-box;overflow:hidden;position:absolute;top:0}.fixedDataTableRow_body{left:0;position:absolute;top:0}.public_fixedDataTableRow_highlighted,.public_fixedDataTableRow_highlighted .public_fixedDataTableCell_main{background-color:#f6f7f8}.fixedDataTableRow_fixedColumnsDivider{-webkit-backface-visibility:hidden;backface-visibility:hidden;border-left:solid 1px #d3d3d3;left:0;position:absolute;top:0;width:0}.fixedDataTableRow_columnsShadow{background:0 0 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABCAYAAAD5PA/NAAAAFklEQVQIHWPSkNeSBmJhTQVtbiDNCgASagIIuJX8OgAAAABJRU5ErkJggg==) repeat-y;width:4px}.fixedDataTableRow_rowWrapper{position:absolute;top:0}\n';

var FixedDataTableCss = (function (_React$Component) {
  function FixedDataTableCss() {
    _classCallCheck(this, FixedDataTableCss);

    _get(Object.getPrototypeOf(FixedDataTableCss.prototype), 'constructor', this).apply(this, arguments);
  }

  _inherits(FixedDataTableCss, _React$Component);

  _createClass(FixedDataTableCss, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'style',
        null,
        css
      );
    }
  }]);

  return FixedDataTableCss;
})(_react2['default'].Component);

exports['default'] = FixedDataTableCss;
module.exports = exports['default'];