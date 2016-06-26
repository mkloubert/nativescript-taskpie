// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
"use strict";
var Border = require('ui/border');
var Color = require('color');
var Grid = require('ui/layouts/grid-layout');
var image_1 = require('ui/image');
var label_1 = require('ui/label');
var Observable = require('data/observable');
var observable_array_1 = require('data/observable-array');
var dependency_observable_1 = require("ui/core/dependency-observable");
var proxy_1 = require("ui/core/proxy");
var Stack = require('ui/layouts/stack-layout');
var TaskPieHelpers = require('./TaskPieHelpers');
var TypeUtils = require("utils/types");
var UIEnums = require('ui/enums');
var virtual_array_1 = require('data/virtual-array');
/**
 * Name of the field that determines if TaskPie is in edit mode or not.
 */
exports.TASKPIE_FIELD_ISEDITING = 'isEditing';
/**
 * A task pie view.
 */
var TaskPie = (function (_super) {
    __extends(TaskPie, _super);
    /**
     * Initializes a new instance of that class.
     */
    function TaskPie(json) {
        _super.call(this, json);
        this.init();
        this.refresh();
    }
    /**
     * Adds a task category.
     *
     * @chainable
     *
     * @param {String} name The name of the category.
     * @param {IArgb} color The color.
     * @param {Number} [count] The name of the category.
     */
    TaskPie.prototype.addCategory = function (name, color, count) {
        if (count === void 0) { count = 0; }
        var cats = this._categories;
        cats.push(new TaskCategory(this, name, color, count));
        this.refresh();
        return this;
    };
    Object.defineProperty(TaskPie.prototype, "categories", {
        /**
         * Gets or sets the list of categories.
         */
        get: function () {
            return this._categories;
        },
        set: function (value) {
            var me = this;
            if (TypeUtils.isNullOrUndefined(value)) {
                value = new observable_array_1.ObservableArray();
            }
            this._categories = value;
            this.updateCategories();
            this.notifyPropertyChange("category", value);
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "categoryGrid", {
        /**
         * Gets the grid that stores the category views.
         */
        get: function () {
            return this._categoryGrid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "categoryStyle", {
        /**
         * Sets the style for the category grid.
         */
        set: function (style) {
            this._categoryStyle = style;
            this.updateCategoryStyle();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clears all categories.
     */
    TaskPie.prototype.clearCategories = function () {
        this.categories = new observable_array_1.ObservableArray();
        return this;
    };
    Object.defineProperty(TaskPie.prototype, "description", {
        /**
         * Gets or sets the description.
         */
        get: function () {
            return this._descriptionField.text;
        },
        set: function (value) {
            if (value === this._descriptionField.text) {
                return;
            }
            this._descriptionField.text = value;
            this.updateVisibilityOfViewByString(this._descriptionField.text, this._descriptionField);
            this.notifyPropertyChange("description", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "descriptionField", {
        /**
         * Gets the field with the description.
         */
        get: function () {
            return this._descriptionField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "descriptionStyle", {
        /**
         * Sets the style for the description field.
         */
        set: function (style) {
            this._descriptionField.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Switches the view in 'edit' mode what means that
     * 'refresh' method will be ignored until that view
     * leaves that mode.
     *
     * @chainable
     *
     * @param {Function} action The action to invoke.
     * @param {Boolean} [refresh] Call 'refresh' method after action was invoked or not.
     */
    TaskPie.prototype.edit = function (action, refresh) {
        if (refresh === void 0) { refresh = true; }
        try {
            this.set(exports.TASKPIE_FIELD_ISEDITING, true);
            action(this);
        }
        finally {
            this.set(exports.TASKPIE_FIELD_ISEDITING, false);
            if (refresh) {
                this.refresh();
            }
        }
        return this;
    };
    /**
     * Returns a category by index.
     *
     * @param {Number} index The zero based index.
     *
     * @return {ITaskCategory} The category.
     */
    TaskPie.prototype.getCategory = function (index) {
        return this._categoryGetter(index);
    };
    /**
     * Initializes that instance.
     */
    TaskPie.prototype.init = function () {
        var me = this;
        me.set(exports.TASKPIE_FIELD_ISEDITING, false);
        this.cssClass = 'nsTaskPie';
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addColumn(new Grid.ItemSpec(1, "star"));
        var pieGrid = new Grid.GridLayout();
        pieGrid.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        pieGrid.verticalAlignment = UIEnums.VerticalAlignment.center;
        pieGrid.addRow(new Grid.ItemSpec(1, "auto"));
        pieGrid.addColumn(new Grid.ItemSpec(1, "star"));
        pieGrid.addColumn(new Grid.ItemSpec(4, "star"));
        pieGrid.addColumn(new Grid.ItemSpec(1, "star"));
        this.addChild(pieGrid);
        Grid.GridLayout.setRow(pieGrid, 0);
        Grid.GridLayout.setColumn(pieGrid, 0);
        // pie
        this._pieImage = new image_1.Image();
        this._pieImage.cssClass = 'nsTaskPie-pie';
        this._pieImage.stretch = UIEnums.Stretch.aspectFill;
        this._pieImage.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieImage.verticalAlignment = UIEnums.VerticalAlignment.center;
        pieGrid.addChild(this._pieImage);
        Grid.GridLayout.setRow(this._pieImage, 0);
        Grid.GridLayout.setColumn(this._pieImage, 1);
        var stack = new Stack.StackLayout();
        stack.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        stack.verticalAlignment = UIEnums.VerticalAlignment.center;
        this.addChild(stack);
        Grid.GridLayout.setRow(stack, 0);
        Grid.GridLayout.setColumn(stack, 0);
        // pie text
        this._pieTextField = new label_1.Label();
        this._pieTextField.cssClass = 'nsTaskPie-pieText';
        this._pieTextField.textWrap = true;
        stack.addChild(this._pieTextField);
        // pie sub text
        this._pieSubTextField = new label_1.Label();
        this._pieSubTextField.cssClass = 'nsTaskPie-pieSubText';
        this._pieSubTextField.textWrap = true;
        stack.addChild(this._pieSubTextField);
        // description
        this._descriptionField = new label_1.Label();
        this._descriptionField.cssClass = 'nsTaskPie-description';
        this._descriptionField.textWrap = true;
        this._descriptionField.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._descriptionField.verticalAlignment = UIEnums.VerticalAlignment.center;
        this.addChild(this._descriptionField);
        Grid.GridLayout.setRow(this._descriptionField, 1);
        // initialize with defaults
        this.edit(function (pie) {
            pie.clearCategories();
            pie.addCategory('Not started', 'ffc90e');
            pie.addCategory('Late', 'd54130');
            pie.addCategory('In progress', '4cabe1');
            pie.addCategory('Completed', '88be39');
        });
    };
    Object.defineProperty(TaskPie.prototype, "length", {
        /**
         * Gets the number of categories.
         */
        get: function () {
            return this._categoryLength();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieImage", {
        /**
         * Gets the image with the pie.
         */
        get: function () {
            return this._pieImage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSize", {
        /**
         * Gets or sets the pie size.
         */
        get: function () {
            return this._pieSize;
        },
        set: function (value) {
            if (this._pieSize === value) {
                return;
            }
            this._pieSize = value;
            this.notifyPropertyChange("pieSize", value);
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieStyle", {
        /**
         * Sets the style for the pie image.
         */
        set: function (style) {
            this._pieImage.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSubText", {
        /**
         * Gets or sets the pie sub text.
         */
        get: function () {
            return this._pieSubTextField.text;
        },
        set: function (value) {
            if (this._pieSubTextField.text === value) {
                return;
            }
            this._pieSubTextField.text = value;
            this.updateVisibilityOfViewByString(this._pieSubTextField.text, this._pieSubTextField);
            this.notifyPropertyChange("pieSubText", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSubTextField", {
        /**
         * Gets the text field with the pie sub text.
         */
        get: function () {
            return this._pieSubTextField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSubTextStyle", {
        /**
         * Sets the style for the pie sub text field.
         */
        set: function (style) {
            this._pieSubTextField.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieText", {
        /**
         * Gets or sets the pie text.
         */
        get: function () {
            return this._pieTextField.text;
        },
        set: function (value) {
            if (this._pieTextField.text === value) {
                return;
            }
            this._pieTextField.text = value;
            this.updateVisibilityOfViewByString(this._pieTextField.text, this._pieTextField);
            this.notifyPropertyChange("pieSubText", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieTextField", {
        /**
         * Gets the text field with the pie text.
         */
        get: function () {
            return this._pieTextField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieTextStyle", {
        /**
         * Sets the style for the pie text field.
         */
        set: function (style) {
            this._pieTextField.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Refreshs the view.
     */
    TaskPie.prototype.refresh = function () {
        if (this.get(exports.TASKPIE_FIELD_ISEDITING)) {
            return;
        }
        var categories = this._categories;
        var categoryLength = this._categoryLength;
        var categoryGetter = this._categoryGetter;
        if (!TypeUtils.isNullOrUndefined(this._categoryGrid)) {
            this.removeChild(this._categoryGrid);
            while (this._categoryGrid.getChildrenCount() > 0) {
                var catView = this._categoryGrid.getChildAt(0);
                this._categoryGrid.removeChild(catView);
            }
        }
        var pieSize = 600.0;
        if (!isEmptyString(this._pieSize)) {
            pieSize = parseFloat(('' + this._pieSize).trim());
        }
        var ratio = pieSize / 300.0;
        var isPieVisible = false;
        var pieBitmap = TaskPieHelpers.createBitmap(pieSize, pieSize);
        try {
            // get number of total tasks
            var total = 0;
            for (var i = 0; i < categoryLength(); i++) {
                var cat = categoryGetter(i);
                if (!isNaN(cat.count)) {
                    total += cat.count;
                }
            }
            // draw pie
            if (total > 0) {
                isPieVisible = true;
                var startAngel = 0;
                for (var i = 0; i < categoryLength(); i++) {
                    var cat = categoryGetter(i);
                    if (TypeUtils.isNullOrUndefined(cat.count) ||
                        cat.count <= 0) {
                        continue;
                    }
                    var sweetAngel;
                    if (i < (this._categories.length - 1)) {
                        sweetAngel = cat.count / total * 360;
                    }
                    else {
                        sweetAngel = 360 - startAngel;
                    }
                    pieBitmap.drawArc(16 * ratio, 16 * ratio, pieSize - 16 * ratio, pieSize - 16 * ratio, startAngel, sweetAngel, cat.color, cat.color);
                    startAngel += sweetAngel;
                }
                var innerColor = this._pieImage.backgroundColor;
                if (TypeUtils.isNullOrUndefined(innerColor)) {
                    innerColor = new Color.Color('white');
                }
                pieBitmap.drawCircle(pieSize / 2.0, pieSize / 2.0, pieSize / 2.0 - 56.0 * ratio, innerColor, innerColor);
            }
            this._pieImage.src = pieBitmap.toDataUrl();
        }
        finally {
            pieBitmap.dispose();
        }
        this._pieImage.visibility = isPieVisible ? UIEnums.Visibility.visible
            : UIEnums.Visibility.collapsed;
        // categories
        var newCatGrid = new Grid.GridLayout();
        newCatGrid = new Grid.GridLayout();
        newCatGrid.addRow(new Grid.ItemSpec(1, "star"));
        newCatGrid.cssClass = 'nsTaskPie-categories';
        if (categoryLength() > 0) {
            for (var i = 0; i < this._categories.length; i++) {
                var cat = categoryGetter(i);
                newCatGrid.addColumn(new Grid.ItemSpec(this._categories.length, "star"));
                // category stack
                var newCatView = new Stack.StackLayout();
                newCatView.cssClass = 'nsTaskPie-category';
                newCatGrid.addChild(newCatView);
                Grid.GridLayout.setRow(newCatView, 0);
                Grid.GridLayout.setColumn(newCatView, i);
                // border
                var catViewBorder = new Border.Border();
                catViewBorder.cssClass = 'nsTaskPie-border';
                catViewBorder.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                if (!isEmptyString(cat.color)) {
                    catViewBorder.backgroundColor = new Color.Color('#' + cat.color);
                }
                newCatView.addChild(catViewBorder);
                // count
                var catViewCountLabel = new label_1.Label();
                catViewCountLabel.textWrap = true;
                catViewCountLabel.cssClass = 'nsTaskPie-count';
                catViewCountLabel.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                if (!isEmptyString(cat.count)) {
                    catViewCountLabel.text = ('' + cat.count).trim();
                }
                this.updateVisibilityOfViewByString(catViewCountLabel.text, catViewCountLabel);
                newCatView.addChild(catViewCountLabel);
                // task name
                var catViewNameLabel = new label_1.Label();
                catViewNameLabel.textWrap = true;
                catViewNameLabel.cssClass = 'nsTaskPie-name';
                catViewNameLabel.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                if (!isEmptyString(cat.name)) {
                    catViewNameLabel.text = ('' + cat.name).trim();
                }
                this.updateVisibilityOfViewByString(catViewNameLabel.text, catViewNameLabel);
                newCatView.addChild(catViewNameLabel);
            }
        }
        this.addChild(newCatGrid);
        Grid.GridLayout.setRow(newCatGrid, 2);
        Grid.GridLayout.setColumn(newCatGrid, 0);
        this._categoryGrid = newCatGrid;
        this.updateCategoryStyle();
    };
    /**
     * Removes a category at a specific position.
     *
     * @chainable
     *
     * @param {Number} index The zero based index.
     */
    TaskPie.prototype.removeCategory = function (index) {
        var cats = this._categories;
        cats.splice(index, 1);
        return this;
    };
    /**
     * Updates anything for the category storage.
     */
    TaskPie.prototype.updateCategories = function () {
        this.updateCategoryGetters();
        this.updateCategoryListeners();
    };
    /**
     * Updates the getter callbacks for the current list of categories.
     */
    TaskPie.prototype.updateCategoryGetters = function () {
        var cats = this._categories;
        if (!TypeUtils.isNullOrUndefined(cats)) {
            this._categoryLength = function () { return cats.length; };
            if ((cats instanceof observable_array_1.ObservableArray) ||
                (cats instanceof virtual_array_1.VirtualArray)) {
                this._categoryGetter = function (itemIndex) { return cats.getItem(itemIndex); };
            }
            else {
                this._categoryGetter = function (itemIndex) { return cats[itemIndex]; };
            }
        }
        else {
            this._categoryGetter = null;
            this._categoryLength = null;
        }
    };
    /**
     * Updates the listeners for the category storage.
     */
    TaskPie.prototype.updateCategoryListeners = function () {
        var me = this;
        var cats = this._categories;
        if (!TypeUtils.isNullOrUndefined(this._categoryListener)) {
            this._categoryListener
                .object.off(Observable.Observable.propertyChangeEvent, this._categoryListener.callback);
        }
        this._categoryListener = null;
        if (cats instanceof Observable.Observable) {
            this._categoryListener = {
                object: cats,
                callback: function (e) {
                    switch (e.propertyName) {
                        case 'length':
                            me.refresh();
                            me.notifyPropertyChange('length', me.length);
                            break;
                    }
                }
            };
            this._categoryListener
                .object.on(Observable.Observable.propertyChangeEvent, this._categoryListener.callback);
        }
    };
    /**
     * Updates the style of the current category grid.
     */
    TaskPie.prototype.updateCategoryStyle = function () {
        var catGrid = this._categoryGrid;
        if (TypeUtils.isNullOrUndefined(catGrid)) {
            return;
        }
        var style = this._categoryStyle;
        if (!isEmptyString(style)) {
            catGrid.setInlineStyle(style);
        }
    };
    /**
     * Updates the visibility of a view by a string.
     *
     * @param {String} str The string.
     * @param {View} view The view to update.
     * @param {String} [ifEmpty] The custom visibility value if 'str' is empty.
     * @param {String} [ifNotEmpty] The custom visibility value if 'str' is NOT empty.
     */
    TaskPie.prototype.updateVisibilityOfViewByString = function (str, view, ifEmpty, ifNotEmpty) {
        if (ifEmpty === void 0) { ifEmpty = UIEnums.Visibility.collapsed; }
        if (ifNotEmpty === void 0) { ifNotEmpty = UIEnums.Visibility.visible; }
        if (TypeUtils.isNullOrUndefined(view)) {
            return;
        }
        if (!isEmptyString(str)) {
            if (!isEmptyString(ifNotEmpty)) {
                view.visibility = ifNotEmpty;
            }
        }
        else {
            if (!isEmptyString(ifEmpty)) {
                view.visibility = ifEmpty;
            }
        }
    };
    /**
     * Dependency property for 'pieSize'
     */
    TaskPie.categoriesProperty = new dependency_observable_1.Property("categories", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable));
    /**
     * Dependency property for 'categoryStyle'
     */
    TaskPie.categoryStyleProperty = new dependency_observable_1.Property("categoryStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.categoryStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'description'
     */
    TaskPie.descriptionProperty = new dependency_observable_1.Property("description", "TaskPie", new proxy_1.PropertyMetadata('', dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.description = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'descriptionStyle'
     */
    TaskPie.descriptionStyleProperty = new dependency_observable_1.Property("descriptionStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.descriptionStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieSize'
     */
    TaskPie.pieSizeProperty = new dependency_observable_1.Property("pieSize", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function (value) {
        return !isNaN(value) || TypeUtils.isNullOrUndefined(value);
    }, function (data) {
        var tp = data.object;
        var newValue = data.newValue;
        if (TypeUtils.isNullOrUndefined(newValue)) {
            newValue = TaskPieHelpers.getDefaultPieSize();
        }
        tp.pieSize = parseFloat(toStringSafe(data.newValue).trim());
    }));
    /**
     * Dependency property for 'pieStyle'
     */
    TaskPie.pieStyleProperty = new dependency_observable_1.Property("pieStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieSubText'
     */
    TaskPie.pieSubTextProperty = new dependency_observable_1.Property("pieSubText", "TaskPie", new proxy_1.PropertyMetadata('', dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieSubText = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieSubTextStyle'
     */
    TaskPie.pieSubTextStyleProperty = new dependency_observable_1.Property("pieSubTextStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieSubTextStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieText'
     */
    TaskPie.pieTextProperty = new dependency_observable_1.Property("pieText", "TaskPie", new proxy_1.PropertyMetadata('', dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieText = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieTextStyle'
     */
    TaskPie.pieTextStyleProperty = new dependency_observable_1.Property("pieTextStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieTextStyle = toStringSafe(data.newValue);
    }));
    return TaskPie;
}(Grid.GridLayout));
exports.TaskPie = TaskPie;
/**
 * A notifiable task category.
 */
var TaskCategory = (function (_super) {
    __extends(TaskCategory, _super);
    /**
     * Initializes a new instance of that class.
     *
     * @param {TaskPie} parent The parent element.
     * @param {String} name The name.
     * @param {IArgb} [color] The color.
     * @param {Number} [count] The count.
     */
    function TaskCategory(parent, name, color, count) {
        if (count === void 0) { count = 0; }
        _super.call(this);
        this._count = 0;
        this._parent = parent;
        this._name = name;
        this._count = count;
        this._color = color;
    }
    Object.defineProperty(TaskCategory.prototype, "color", {
        /** @inheritdoc */
        get: function () {
            return this._color;
        },
        set: function (value) {
            if (this._color === value) {
                return;
            }
            this._color = value;
            this.notifyPropertyChange("color", value);
            this.parent.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "count", {
        /** @inheritdoc */
        get: function () {
            return this._count;
        },
        set: function (value) {
            if (this._count === value) {
                return;
            }
            this._count = value;
            this.notifyPropertyChange("count", value);
            this.parent.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "name", {
        /** @inheritdoc */
        get: function () {
            return this._name;
        },
        set: function (value) {
            if (this._name === value) {
                return;
            }
            this._name = '' + value;
            this.notifyPropertyChange("name", value);
            this.parent.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "parent", {
        /**
         * Gets the parent element.
         */
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    return TaskCategory;
}(Observable.Observable));
exports.TaskCategory = TaskCategory;
function isEmptyString(str) {
    return TypeUtils.isNullOrUndefined(str) ||
        '' === ('' + str).trim();
}
function toStringSafe(v) {
    if (TypeUtils.isNullOrUndefined(v)) {
        return '';
    }
    return '' + v;
}
//# sourceMappingURL=index.js.map