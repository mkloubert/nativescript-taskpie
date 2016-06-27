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

import Border = require('ui/border');
import Color = require('color');
import Grid = require('ui/layouts/grid-layout');
import {Image} from 'ui/image';
import {Label} from 'ui/label';
import Observable = require('data/observable');
import {ObservableArray} from 'data/observable-array';
import {Property, PropertyMetadataSettings} from "ui/core/dependency-observable";
import {PropertyMetadata} from "ui/core/proxy";
import Stack = require('ui/layouts/stack-layout');
var TaskPieHelpers = require('./TaskPieHelpers');
import TypeUtils = require("utils/types");
import UIEnums = require('ui/enums');
import {View}  from 'ui/core/view';
import {VirtualArray} from 'data/virtual-array';

/**
 * Name of the field that determines if TaskPie is in edit mode or not.
 */
export const TASKPIE_FIELD_ISEDITING = 'isEditing';

/**
 * Describes a bitmap.
 */
export interface IBitmap {
    /**
     * Applies that bitmap over an image view.
     * 
     * @param {Image} view The target view.
     * @param {Boolean} [disposeOld] Dispose old bitmap of view or not.
     * 
     * @return {Boolean} Operation was successful or not.
     */
    apply(view: Image, disposeOld?: boolean): boolean;

    /**
     * Frees memory.
     */
    dispose();

    /**
     * Draw the specified arc, which will be scaled to fit inside the specified oval.
     * 
     * @chainable
     * 
     * @param {Number} left
     * @param {Number} top 
     * @param {Number} right 
     * @param {Number} bottom 
     * @param {Number} startAngle Starting angle (in degrees) where the arc begins.
     * @param {Number} sweepAngle Sweep angle (in degrees) measured clockwise.
     * @param {IArgb} [color] The border color.
     * @param {IArgb} [fillColor] The fill color.
     */
    drawArc(left: number, top: number, right: number, bottom: number,
            startAngle: number, sweepAngle: number,
            color?: string | number | Color.Color, fillColor?: string | number | Color.Color): IBitmap;

    /**
     * Draws a circle.
     * 
     * @chainable
     * 
     * @param {Number} cx The x coordinate of the center of the circle.
     * @param {Number} cy The y coordinate of the center of the circle.
     * @param {IArgb} [color] The border color.
     * @param {IArgb} [fillColor] The fill color.
     */
    drawCircle(cx: number, cy: number, radius: number,
               color?: string | number | Color.Color, fillColor?: string | number | Color.Color): IBitmap;

    /**
     * Returns that bitmap as data url in PNG format.
     * 
     * @return {String} The bitmap as data url.
     */
    toDataUrl(): string;
}

/**
 * Describes a task category.
 */
export interface ITaskCategory {
    /**
     * The color.
     */
    color?: string | number | Color.Color;

    /**
     * Number of tasks.
     */
    count?: number;

    /**
     * The name.
     */
    name: string;

    /**
     * The type.
     */
    type?: TaskCategoryType;
}

/**
 * A task pie view.
 */
export class TaskPie extends Grid.GridLayout {
    /**
     * Dependency property for 'categories'
     */
    public static categoriesProperty = new Property(
        "categories",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             (value) => TypeUtils.isNullOrUndefined(value) ||
                                        (value instanceof Array) ||
                                        (value instanceof ObservableArray) ||
                                        (value instanceof VirtualArray),
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.categories = data.newValue;
                             })
    );
    /**
     * Dependency property for 'categoryStyle'
     */
    public static categoryStyleProperty = new Property(
        "categoryStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.categoryStyle = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'countChanged'
     */
    public static countChangedProperty = new Property(
        "countChanged",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.countChanged = data.newValue;
                             })
    );
    /**
     * Dependency property for 'counts'
     */
    public static countsProperty = new Property(
        "counts",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             (value) => (value instanceof Array) ||
                                        (value instanceof ObservableArray) ||
                                        (value instanceof VirtualArray) ||
                                        isEmptyString(value),
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.counts = data.newValue;
                             })
    );
    /**
     * Dependency property for 'description'
     */
    public static descriptionProperty = new Property(
        "description",
        "TaskPie",
        new PropertyMetadata('',
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.description = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'descriptionStyle'
     */
    public static descriptionStyleProperty = new Property(
        "descriptionStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.descriptionStyle = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieGridStyle'
     */
    public static pieGridStyleProperty = new Property(
        "pieGridStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieGridStyle = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieSize'
     */
    public static pieSizeProperty = new Property(
        "pieSize",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             (value) => {
                                 return !isNaN(value) || TypeUtils.isNullOrUndefined(value);
                             },
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 var newValue = data.newValue;
                                 if (TypeUtils.isNullOrUndefined(newValue)) {
                                     newValue = TaskPieHelpers.getDefaultPieSize();
                                 }

                                 tp.pieSize = parseFloat(toStringSafe(data.newValue).trim());
                             })
    );
    /**
     * Dependency property for 'pieStyle'
     */
    public static pieStyleProperty = new Property(
        "pieStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieStyle = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieSubText'
     */
    public static pieSubTextProperty = new Property(
        "pieSubText",
        "TaskPie",
        new PropertyMetadata('',
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieSubText = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieSubTextStyle'
     */
    public static pieSubTextStyleProperty = new Property(
        "pieSubTextStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieSubTextStyle = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieText'
     */
    public static pieTextProperty = new Property(
        "pieText",
        "TaskPie",
        new PropertyMetadata('',
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieText = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieTextAreaStyle'
     */
    public static pieTextAreaStyleProperty = new Property(
        "pieTextAreaStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieTextAreaStyle = toStringSafe(data.newValue);
                             })
    );
    /**
     * Dependency property for 'pieTextStyle'
     */
    public static pieTextStyleProperty = new Property(
        "pieTextStyle",
        "TaskPie",
        new PropertyMetadata(null,
                             PropertyMetadataSettings.Inheritable,
                             null,
                             () => true,
                             (data) => {
                                 var tp = <TaskPie>data.object;

                                 tp.pieTextStyle = toStringSafe(data.newValue);
                             })
    );

    private _categories: ITaskCategory[] | ObservableArray<ITaskCategory> | VirtualArray<ITaskCategory>;
    private _categoryGetter: (itemIndex: number) => ITaskCategory;
    private _categoryLength: () => number;
    private _categoryListener: { callback: (data: Observable.EventData) => void, object: Observable.Observable };
    private _categoryGrid: Grid.GridLayout;
    private _categoryStyle: string;
    private _descriptionField: Label;
    private _pieGrid: Grid.GridLayout;
    private _pieImage: Image;
    private _pieSize: number;
    private _pieSubTextField: Label;
    private _pieTextArea: Stack.StackLayout;
    private _pieTextField: Label;

    /**
     * Initializes a new instance of that class.
     */
    constructor(json?: any) {
        super(json);

        this.init();
        this.refresh();
    }

    /**
     * Adds a task category.
     * 
     * @chainable
     * 
     * @param {String} name The name of the category.
     * @param {Color.Color} color The color.
     * @param {Number} [count] The name of the category.
     */
    public addCategory(name: string, color: string | Color.Color | number, type?: TaskCategoryType, count: number = 0): TaskPie {
        var cats: any = this._categories;
        cats.push(new TaskCategory(this, name, color, type, count));
        
        this.refresh();
        return this;
    }

    /**
     * Gets or sets the list of categories.
     */
    public get categories(): ITaskCategory[] | ObservableArray<ITaskCategory> | VirtualArray<ITaskCategory> {
        return this._categories;
    }
    public set categories(value: ITaskCategory[] | ObservableArray<ITaskCategory> | VirtualArray<ITaskCategory>) {
        var me = this;

        if (TypeUtils.isNullOrUndefined(value)) {
            value = new ObservableArray<ITaskCategory>();
        }

        this._categories = value;
        this.updateCategories();

        this.refresh();

        this.raiseCategoryProperties(true);
    }

    /**
     * Sets a custom function that creates a view from a task category.
     */
    public categoryFactory: (category: ITaskCategory, index: number, pie: TaskPie) => View;

    /**
     * Gets the grid that stores the category views.
     */
    public get categoryGrid(): Grid.GridLayout {
        return this._categoryGrid;
    }

    /**
     * Sets the style for the category grid.
     */
    public set categoryStyle(style: string) {
        this._categoryStyle = style;
        
        this.updateCategoryStyle();
    }

    /**
     * Clears all categories.
     */
    public clearCategories(): TaskPie {
        this.categories = new ObservableArray<ITaskCategory>();
        return this;
    }

    /**
     * Gets or sets the callback that is invoked when the count value of a task category has been changed.
     */
    public countChanged: (cat: ITaskCategory, newValue: number, oldValue: number, pie: TaskPie) => void | string;

    /**
     * Gets or sets the 'count' values of the underlying task categories.
     * 
     * @throws At least one new value is no valid number.
     */
    public get counts(): string | number[] | ObservableArray<number> | VirtualArray<number> {
        var countList = new ObservableArray<number>();
        
        for (var i = 0; i < this._categoryLength(); i++) {
            var cnt: number = null;
            
            var cat = this._categoryGetter(i);
            if (!TypeUtils.isNullOrUndefined(cat)) {
                cnt = cat.count;
            }

            countList.push(cnt);
        }

        return countList;
    }
    public set counts(value: string | number[] | ObservableArray<number> | VirtualArray<number>) {
        if (isEmptyString(value)) {
            return;
        }

        var v: any = value;

        if (!(v instanceof ObservableArray) && !(v instanceof VirtualArray)) {
            // handle as , separated string
            // and convert 'v' to an array of numbers

            var parts = ('' + v).trim().split(',');
            v = [];

            for (var i = 0; i < parts.length; i++) {
                var p: any = parts[i].trim();
                var cv = null;

                if (!isEmptyString(p)) {
                    if (isNaN(p)) {
                        throw "'" + p + "' is NOT a number!";
                    }

                    cv = parseFloat(p);
                }

                v.push(cv);
            }
        }

        var itemGetter: (itemIndex: number) => number = (itemIndex) => v[itemIndex];
        if ((v instanceof ObservableArray) || (v instanceof VirtualArray)) {
            itemGetter = (itemIndex) => v.getItem(itemIndex);
        }

        for (var i = 0; i < v.length; i++) {
            if (i >= this._categoryLength()) {
                break;
            }

            var nv = itemGetter(i);
            if (isEmptyString(nv)) {
                continue;
            }

            var cat = this._categoryGetter(i);
            cat.count = nv;
        }
    }

    /**
     * Increases the count value of a category.
     * 
     * @chainable
     * 
     * @param {Number} index The zero based index of the category.
     * @param any [decreaseBy] The custom value to use or the function provides it.
     * 
     * @throws Decrease value is NOT valid.
     */
    public decrease(index: number, decreaseBy?: (curVal: number, category: ITaskCategory, index: number, pie: TaskPie) => number | number): TaskPie {
        if (TypeUtils.isNullOrUndefined(decreaseBy)) {
            decreaseBy = <any>1;
        }
        
        var decreaseByFunc: any = decreaseBy;
        if (typeof decreaseByFunc !== "function") {
            decreaseByFunc = () => decreaseBy;
        }

        var cat = this._categoryGetter(index);
        var decreaseVal = decreaseByFunc(cat.count, cat, index, this);
        if (!isEmptyString(decreaseVal)) {
            decreaseVal = ('' + decreaseVal).trim();
            if (isNaN(decreaseVal)) {
                throw "'" + decreaseVal + "' is NOT a valid number!";
            }

            decreaseVal = parseFloat(decreaseVal);

            var newValue = cat.count;
            if (isEmptyString(newValue)) {
                newValue = 0;
            }

            newValue -= decreaseVal;
            cat.count = newValue;
        }

        return this;
    }

    /**
     * Gets or sets the description.
     */
    public get description(): string {
        return this._descriptionField.text;
    }
    public set description(value: string) {
        if (value === this._descriptionField.text) {
            return;
        }

        this._descriptionField.text = value;
        this.updateVisibilityOfViewByString(this._descriptionField.text,
                                            this._descriptionField);

        this.notifyPropertyChange("description", value);
    }

    /**
     * Gets the field with the description.
     */
    public get descriptionField(): Label {
        return this._descriptionField;
    }

    /**
     * Sets the style for the description field.
     */
    public set descriptionStyle(style: string) {
        this._descriptionField.setInlineStyle(style);
    }

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
    public edit(action: (pie: TaskPie) => void,
                refresh: boolean = true): TaskPie {
        try {
            this.set(TASKPIE_FIELD_ISEDITING, true);

            action(this);
        }
        finally {
            this.set(TASKPIE_FIELD_ISEDITING, false);

            if (refresh) {
                this.refresh();
            }
        }

        return this;
    }

    /**
     * Returns a category by index.
     * 
     * @param {Number} index The zero based index.
     * 
     * @return {ITaskCategory} The category.
     */
    public getCategory(index: number): ITaskCategory {
        return this._categoryGetter(index);
    }

    /**
     * Increases the count value of a category.
     * 
     * @chainable
     * 
     * @param {Number} index The zero based index of the category.
     * @param any [increaseBy] The custom value to use or the function provides it.
     * 
     * @throws Increase value is NOT valid.
     */
    public increase(index: number, increaseBy?: (curVal: number, category: ITaskCategory, index: number, pie: TaskPie) => number | number): TaskPie {
        if (TypeUtils.isNullOrUndefined(increaseBy)) {
            increaseBy = <any>1;
        }
        
        var increaseByFunc: any = increaseBy;
        if (typeof increaseByFunc !== "function") {
            increaseByFunc = () => increaseBy;
        }

        var cat = this._categoryGetter(index);
        var increaseVal = increaseByFunc(cat.count, cat, index, this);
        if (!isEmptyString(increaseVal)) {
            increaseVal = ('' + increaseVal).trim();
            if (isNaN(increaseVal)) {
                throw "'" + increaseVal + "' is NOT a valid number!";
            }

            increaseVal = parseFloat(increaseVal);

            var newValue = cat.count;
            if (isEmptyString(newValue)) {
                newValue = 0;
            }

            newValue += increaseVal;
            cat.count = newValue;
        }

        return this;
    }

    /**
     * Initializes that instance.
     */
    protected init() {
        var me = this;
        me.set(TASKPIE_FIELD_ISEDITING, false);

        this.cssClass = 'nsTaskPie';
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addColumn(new Grid.ItemSpec(1, "star"));

        // pie grid
        this._pieGrid = new Grid.GridLayout();
        this._pieGrid.cssClass = 'nsTaskPie-pieArea';
        this._pieGrid.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieGrid.verticalAlignment =  UIEnums.VerticalAlignment.center;
        this._pieGrid.addRow(new Grid.ItemSpec(1, "auto"));
        this._pieGrid.addColumn(new Grid.ItemSpec(1, "star"));
        this._pieGrid.addColumn(new Grid.ItemSpec(4, "star"));
        this._pieGrid.addColumn(new Grid.ItemSpec(1, "star"));
        this.addChild(this._pieGrid);
        Grid.GridLayout.setRow(this._pieGrid, 0);
        Grid.GridLayout.setColumn(this._pieGrid, 0);

        // pie
        this._pieImage = new Image();
        this._pieImage.cssClass = 'nsTaskPie-pie';
        this._pieImage.stretch = UIEnums.Stretch.aspectFill;
        this._pieImage.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieImage.verticalAlignment =  UIEnums.VerticalAlignment.center;
        this._pieGrid.addChild(this._pieImage);
        Grid.GridLayout.setRow(this._pieImage, 0);
        Grid.GridLayout.setColumn(this._pieImage, 1);

        this._pieTextArea = new Stack.StackLayout();
        this._pieTextArea.cssClass = 'nsTaskPie-textArea';
        this._pieTextArea.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieTextArea.verticalAlignment = UIEnums.VerticalAlignment.center;
        this._pieGrid.addChild(this._pieTextArea);
        Grid.GridLayout.setRow(this._pieTextArea, 0);
        Grid.GridLayout.setColumn(this._pieTextArea, 0);
        Grid.GridLayout.setColumnSpan(this._pieTextArea, 3);

        // pie text
        this._pieTextField = new Label();
        this._pieTextField.cssClass = 'nsTaskPie-text';
        this._pieTextField.textWrap = true;
        this._pieTextArea.addChild(this._pieTextField);

        // pie sub text
        this._pieSubTextField = new Label();
        this._pieSubTextField.cssClass = 'nsTaskPie-subText';
        this._pieSubTextField.textWrap = true;
        this._pieTextArea.addChild(this._pieSubTextField);
        
        // description
        this._descriptionField = new Label();
        this._descriptionField.cssClass = 'nsTaskPie-description';
        this._descriptionField.textWrap = true;
        this._descriptionField.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._descriptionField.verticalAlignment = UIEnums.VerticalAlignment.center;
        this.addChild(this._descriptionField);
        Grid.GridLayout.setRow(this._descriptionField, 1);
        Grid.GridLayout.setColumn(this._descriptionField, 0);

        // initialize with defaults
        this.edit((pie) => {
            pie.clearCategories();

            pie.addCategory('Not started', 'ffc90e', TaskCategoryType.NotStarted);
            pie.addCategory('Late', 'd54130', TaskCategoryType.NotStarted);
            pie.addCategory('In progress', '4cabe1', TaskCategoryType.InProgress);
            pie.addCategory('Completed', '88be39', TaskCategoryType.Completed);
        });
    }

    /**
     * Gets the number of categories.
     */
    public get length(): number {
        return this._categoryLength();
    }

    /**
     * Gets the grid that contains the anything of the pie
     * like image and text fields.
     */
    public get pieGrid(): Grid.GridLayout {
        return this._pieGrid;
    }

    /**
     * Sets the style for the pie grid.
     */
    public set pieGridStyle(style: string) {
        this._pieGrid.setInlineStyle(style);
    }

    /**
     * Gets the image with the pie.
     */
    public get pieImage(): Image {
        return this._pieImage;
    }

    /**
     * Gets or sets the pie size.
     */
    public get pieSize(): number {
        return this._pieSize;
    }
    public set pieSize(value: number) {
        if (this._pieSize === value) {
            return;
        }

        this._pieSize = value;
        this.notifyPropertyChange("pieSize", value);

        this.refresh();
    }

    /**
     * Sets the style for the pie image.
     */
    public set pieStyle(style: string) {
        this._pieImage.setInlineStyle(style);
    }

    /**
     * Gets or sets the pie sub text.
     */
    public get pieSubText(): string {
        return this._pieSubTextField.text;
    }
    public set pieSubText(value: string) {
        if (this._pieSubTextField.text === value) {
            return;
        }

        this._pieSubTextField.text = value;
        this.updateVisibilityOfViewByString(this._pieSubTextField.text,
                                            this._pieSubTextField);

        this.notifyPropertyChange("pieSubText", value);
    }

    /**
     * Gets the text field with the pie sub text.
     */
    public get pieSubTextField(): Label {
        return this._pieSubTextField;
    }

    /**
     * Sets the style for the pie sub text field.
     */
    public set pieSubTextStyle(style: string) {
        this._pieSubTextField.setInlineStyle(style);
    }

    /**
     * Gets or sets the pie text.
     */
    public get pieText(): string {
        return this._pieTextField.text;
    }
    public set pieText(value: string) {
        if (this._pieTextField.text === value) {
            return;
        }

        this._pieTextField.text = value;
        this.updateVisibilityOfViewByString(this._pieTextField.text,
                                            this._pieTextField);

        this.notifyPropertyChange("pieSubText", value);
    }

    /**
     * Gets the view that contains the pie texts.
     */
    public get pieTextArea(): Stack.StackLayout {
        return this._pieTextArea;
    }

    /**
     * Sets the style for the pie text area.
     */
    public set pieTextAreaStyle(style: string) {
        this._pieTextArea.setInlineStyle(style);
    }

    /**
     * Gets the text field with the pie text.
     */
    public get pieTextField(): Label {
        return this._pieTextField;
    }

    /**
     * Sets the style for the pie text field.
     */
    public set pieTextStyle(style: string) {
        this._pieTextField.setInlineStyle(style);
    }

    /**
     * Raises all property changes that refer to the categories.
     * 
     * @param {Boolean} [withCategories] Also raise property change for 'categories' or not.
     */
    public raiseCategoryProperties(withCategories: boolean = false) {
        this.notifyPropertyChange('length', this.length);
        this.notifyPropertyChange('totalCompleted', this.totalCompleted);
        this.notifyPropertyChange('totalCount', this.totalCount);
        this.notifyPropertyChange('totalLeft',this.totalLeft);

        if (withCategories) {
            this.notifyPropertyChange("categories", this._categories);
        }
    }

    /**
     * Raises the 'count changed' event callback.
     */
    public raiseCountChanged(category: ITaskCategory, oldValue: number) {
        var pie = this;

        var callback = this.countChanged;
        if (TypeUtils.isNullOrUndefined(callback)) {
            return;
        }

        var cb: any = callback;
        if (typeof cb !== "function") {
            // handle as function name

            var funcName = ('' + cb).trim();
            if ('' !== funcName) {
                cb = () => {
                    eval(funcName + '(category, category.count, oldValue, pie);');
                };
            }
        }

        cb(category, category.count, oldValue, this);
    }

    /**
     * Refreshs the view.
     */
    public refresh() {
        if (this.get(TASKPIE_FIELD_ISEDITING)) {
            return;
        }

        var categories = this._categories;
        var categoryLength = this._categoryLength;
        var categoryGetter = this._categoryGetter;

        // remove old category grid
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
        var disposeBitmap = false;
        var pieBitmap = <IBitmap>TaskPieHelpers.createBitmap(pieSize, pieSize);
        try {
            // draw pie
            var total = this.totalCount;
            if ((null !== total) && total > 0) {
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

                    pieBitmap.drawArc(16 * ratio, 16 * ratio,
                                      pieSize - 16 * ratio, pieSize - 16 * ratio,
                                      startAngel, sweetAngel,
                                      cat.color, cat.color);

                    startAngel += sweetAngel;
                }

                var innerColor = this._pieImage.backgroundColor;
                if (TypeUtils.isNullOrUndefined(innerColor)) {
                    innerColor = new Color.Color('white');
                }

                pieBitmap.drawCircle(pieSize / 2.0, pieSize / 2.0,
                                     pieSize / 2.0 - 56.0 * ratio,
                                     innerColor, innerColor);
            }

            if (!pieBitmap.apply(this._pieImage, true)) {
                disposeBitmap = true;

                this._pieImage.src = pieBitmap.toDataUrl();
            }
        }
        catch (e) {
            disposeBitmap = true;

            throw e;
        }
        finally {
            if (disposeBitmap) {
                pieBitmap.dispose();
            }
        }

        this._pieImage.visibility = isPieVisible ? UIEnums.Visibility.visible
                                                 : UIEnums.Visibility.collapsed;

        // categories
        var newCatGrid = new Grid.GridLayout(); 
        newCatGrid = new Grid.GridLayout();
        newCatGrid.addRow(new Grid.ItemSpec(1, "star"));
        newCatGrid.cssClass = 'nsTaskPie-categories';
        if (categoryLength() > 0) {
            var catFactory = this.categoryFactory;
            if (TypeUtils.isNullOrUndefined(catFactory)) {
                // set default factory

                catFactory = (c: ITaskCategory, ci: number, p: TaskPie) => {
                    // category stack
                    var newCatView = new Stack.StackLayout();
                    newCatView.cssClass = 'nsTaskPie-category';

                    // border
                    var catViewBorder = new Border.Border();
                    catViewBorder.cssClass = 'nsTaskPie-border';
                    catViewBorder.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                    if (!isEmptyString(c.color))
                    {
                        catViewBorder.backgroundColor = new Color.Color('#' + c.color);
                    }
                    newCatView.addChild(catViewBorder);

                    // count
                    var catViewCountLabel = new Label();
                    catViewCountLabel.textWrap = true;
                    catViewCountLabel.cssClass = 'nsTaskPie-count';
                    catViewCountLabel.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                    if (!isEmptyString(c.count)) {
                        catViewCountLabel.text = ('' + c.count).trim();
                    }
                    p.updateVisibilityOfViewByString(catViewCountLabel.text, catViewCountLabel);
                    newCatView.addChild(catViewCountLabel);

                    // task name
                    var catViewNameLabel = new Label();
                    catViewNameLabel.textWrap = true;
                    catViewNameLabel.cssClass = 'nsTaskPie-name';
                    catViewNameLabel.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                    if (!isEmptyString(c.name)) {
                        catViewNameLabel.text = ('' + c.name).trim();
                    }
                    p.updateVisibilityOfViewByString(catViewNameLabel.text, catViewNameLabel);
                    newCatView.addChild(catViewNameLabel);

                    return newCatView;
                };
            }

            for (var i = 0; i < this._categories.length; i++) {
                newCatGrid.addColumn(new Grid.ItemSpec(1, "star"));

                var catView = catFactory(categoryGetter(i), i, this);
                if (TypeUtils.isNullOrUndefined(catView)) {
                    continue;
                }

                newCatGrid.addChild(catView);
                Grid.GridLayout.setRow(catView, 0);
                Grid.GridLayout.setColumn(catView, i);
            }    
        }

        this.addChild(newCatGrid);
        Grid.GridLayout.setRow(newCatGrid, 2);
        Grid.GridLayout.setColumn(newCatGrid, 0);

        this._categoryGrid = newCatGrid;

        this.updateCategoryStyle();
    }

    /**
     * Removes a category at a specific position.
     * 
     * @chainable
     * 
     * @param {Number} index The zero based index.
     */
    public removeCategory(index: number): TaskPie {
        var cats: any = this._categories;
        cats.splice(index, 1);

        return this;
    }

    /**
     * Returns the total number of tasks by type.
     * 
     * @param {TaskType} type The type.
     * 
     * @return {Number} The number of tasks.
     */
    public total(type: TaskCategoryType): number {
        var total = null;
        for (var i = 0; i < this._categoryLength(); i++) {
            var cat = this._categoryGetter(i);

            if (!isNaN(cat.count)) {
                if (null === total) {
                    total = 0;
                }

                if (cat.type == type) {
                    total += cat.count;
                }
            }
        }

        return total;
    }

    /**
     * Gets the total number of completed tasks.
     */
    public get totalCompleted(): number {
        var total = null;
        for (var i = 0; i < this._categoryLength(); i++) {
            var cat = this._categoryGetter(i);

            if (!isNaN(cat.count)) {
                if (null === total) {
                    total = 0;
                }

                switch (cat.type) {
                    case TaskCategoryType.Completed:
                        total += cat.count;
                        break;
                }
            }
        }

        return total;
    }

    /**
     * Gets the total count of all categories.
     */
    public get totalCount(): number {
        var total = null;
        for (var i = 0; i < this._categoryLength(); i++) {
            var cat = this._categoryGetter(i);

            if (!isNaN(cat.count)) {
                if (null === total) {
                    total = 0;
                }

                total += cat.count;
            }
        }

        return total;
    }

    /**
     * Gets the total number of items that are not finished.
     */
    public get totalLeft(): number {
        var total = null;
        for (var i = 0; i < this._categoryLength(); i++) {
            var cat = this._categoryGetter(i);

            if (!isNaN(cat.count)) {
                if (null === total) {
                    total = 0;
                }

                switch (cat.type) {
                    case TaskCategoryType.InProgress:
                    case TaskCategoryType.NotStarted:
                        total += cat.count;
                        break;
                }
            }
        }

        return total;
    }

    /**
     * Updates anything for the category storage.
     */
    protected updateCategories() {
        this.updateCategoryGetters();
        this.updateCategoryListeners();
    }

    /**
     * Updates the getter callbacks for the current list of categories.
     */
    protected updateCategoryGetters() {
        var cats: any = this._categories;

        if (!TypeUtils.isNullOrUndefined(cats)) {
            this._categoryLength = () => cats.length;

            if ((cats instanceof ObservableArray) ||
                (cats instanceof VirtualArray)) {

                this._categoryGetter = (itemIndex) => cats.getItem(itemIndex);
            }
            else {
                this._categoryGetter = (itemIndex) => cats[itemIndex];
            }
        }
        else {
            this._categoryGetter = null;
            this._categoryLength = null;
        }
    }

    /**
     * Updates the listeners for the category storage.
     */
    protected updateCategoryListeners() {
        var me = this;
        
        var cats = this._categories;

        if (!TypeUtils.isNullOrUndefined(this._categoryListener)) {
            this._categoryListener
                .object.off(Observable.Observable.propertyChangeEvent,
                            this._categoryListener.callback);
        }

        this._categoryListener = null;
        if (cats instanceof Observable.Observable) {
            this._categoryListener = {
                object: cats,
                callback: (e: Observable.PropertyChangeData) => {
                    switch (e.propertyName) {
                        case 'length':
                            me.refresh();
                            me.raiseCategoryProperties();
                            break;
                    }
                }
            };

            this._categoryListener
                .object.on(Observable.Observable.propertyChangeEvent, 
                            this._categoryListener.callback);
        }
    }

    /**
     * Updates the style of the current category grid.
     */
    protected updateCategoryStyle() {
        var catGrid = this._categoryGrid;
        if (TypeUtils.isNullOrUndefined(catGrid)) {
            return;
        }

        var style = this._categoryStyle;
        if (!isEmptyString(style)) {
            catGrid.setInlineStyle(style);
        }
    }

    /**
     * Updates the visibility of a view by a string.
     * 
     * @param {String} str The string.
     * @param {View} view The view to update.
     * @param {String} [ifEmpty] The custom visibility value if 'str' is empty.
     * @param {String} [ifNotEmpty] The custom visibility value if 'str' is NOT empty.
     */
    public updateVisibilityOfViewByString(str: string, view: View,
                                          ifEmpty: string = UIEnums.Visibility.collapsed,
                                          ifNotEmpty: string = UIEnums.Visibility.visible) {

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
    }
}


/**
 * List of task category types.
 */
export enum TaskCategoryType {
    /**
     * Pending
     */
    NotStarted = 1,

    /**
     * In progress
     */
    InProgress = 2,

    /**
     * Completed
     */
    Completed = 3,

    /**
     * Skipped
     */
    Skipped = 4,

    /**
     * Failed
     */
    Failed = 5,
}

/**
 * A notifiable task category.
 */
export class TaskCategory extends Observable.Observable implements ITaskCategory {
    private _color: string | number | Color.Color;
    private _count: number = 0;
    private _name: string;
    private _parent: TaskPie;
    private _type: TaskCategoryType;

    /**
     * Initializes a new instance of that class.
     * 
     * @param {TaskPie} parent The parent element.
     * @param {String} name The name.
     * @param {Color.Color} [color] The color.
     * @param {TaskType} [type] The type.
     * @param {Number} [count] The count.
     */
    constructor(parent: TaskPie,
                name: string,
                color?: string | number | Color.Color,
                type?: TaskCategoryType,
                count: number = 0) {
        
        super();

        this._parent = parent;
        this._name = name;
        this._count = count;
        this._color = color;
        this._type = type;
    }
    
    /** @inheritdoc */
    public get color(): string | number | Color.Color {
        return this._color;
    }
    public set color(value: string | number | Color.Color) {
        if (this._color === value) {
            return;
        }

        this._color = value;
        this.notifyPropertyChange("color", value);

        this.parent.refresh();
    }

    /** @inheritdoc */
    public get count(): number {
        return this._count;
    }
    public set count(value: number) {
        if (this._count === value) {
            return;
        }

        var oldValue = this._count;
        this._count = value;
        this.notifyPropertyChange("count", value);

        this.parent.refresh();
        this.parent.raiseCategoryProperties();
        this.parent.raiseCountChanged(this, oldValue);
    }

    /** @inheritdoc */
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        if (this._name === value) {
            return;
        }

        this._name = '' + value;
        this.notifyPropertyChange("name", value);

        this.parent.refresh();
    }

    /**
     * Gets the parent element.
     */
    public get parent(): TaskPie {
        return this._parent;
    }

    /** @inheritdoc */
    public get type(): TaskCategoryType {
        return this._type;
    }
    public set type(value: TaskCategoryType) {
        if (this._type === value) {
            return;
        }

        this._type = value;
        this.notifyPropertyChange("type", value);

        this.parent.refresh();
    }
}

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