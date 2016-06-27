[![npm](https://img.shields.io/npm/v/nativescript-taskpie.svg)](https://www.npmjs.com/package/nativescript-taskpie)
[![npm](https://img.shields.io/npm/dt/nativescript-taskpie.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-taskpie)

# NativeScript Task Pie

A [NativeScript](https://nativescript.org/) module for drawing Microsoft Planner like progress charts.

## License

[MIT license](https://raw.githubusercontent.com/mkloubert/nativescript-taskpie/master/LICENSE)

## Platforms

* Android
* iOS

## Installation

Run

```bash
tns plugin add nativescript-taskpie
```

inside your app project to install the module.

## Demo

The demo app can be found [here](https://github.com/mkloubert/nativescript-taskpie/tree/master/demo).

![Demo app](https://raw.githubusercontent.com/mkloubert/nativescript-taskpie/master/demo.gif)

## Usage

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd"
      xmlns:taskPie="nativescript-taskpie"
      navigatingTo="onNavigatingTo">

  <taskPie:TaskPie id="my-taskpie"
                   description="79 days left"
                   pieText="16" pieSubText="tasks left" />
</Page>
```

Add this CSS to your `app.css`, e.g.

It is possible that you have to customize some properties:

```css
.nsTaskPie-pieArea .nsTaskPie-textArea {
    margin-top: -16;
}

.nsTaskPie-pieArea .nsTaskPie-textArea .nsTaskPie-text {
    text-align: center;
    font-size: 40;
    color: #a6a6a6;
    padding: 0;
}

.nsTaskPie-pieArea .nsTaskPie-textArea .nsTaskPie-subText {
    text-align: center;
    font-size: 20;
    color: #a6a6a6;
    margin-top: -8;
    padding: 0;
}

.nsTaskPie-description {
    font-size: 20;
    margin-bottom: 12;
}

.nsTaskPie-categories .nsTaskPie-category {
    margin-left: 4;
    margin-right: 4;
}

.nsTaskPie-categories .nsTaskPie-border {
    height: 8;
}

.nsTaskPie-categories .nsTaskPie-count,
.nsTaskPie-categories .nsTaskPie-name,
.nsTaskPie-description {
    text-align: center;
    color: #333333;
}

.nsTaskPie-categories .nsTaskPie-count {
    font-size: 16;
    margin-top: 4;
}

.nsTaskPie-categories .nsTaskPie-name {
    font-size: 12;
}
```

To image how the view looks like you can have a look at the following XML:

```xml
<!-- TaskPie -->
<GridLayout cssClass="nsTaskPie"
            rows="auto,auto,auto" columns="*">
  
  <!-- pieGrid() -->
  <GridLayout cssClass="nsTaskPie-pieArea"
              rows="auto" columns="1*,4*,1*"
              horizontalAlignment="stretch" verticalAlignment="center">
        
    <!-- pieImage() -->        
    <Image cssClass="nsTaskPie-pie"
           col="1" row="0"
           horizontalAlignment="stretch" verticalAlignment="center" />
           
    <!-- pieTextArea() -->
    <StackLayout cssClass="nsTaskPie-textArea"
                 col="0" row="0" colspan="3"
                 horizontalAlignment="stretch" verticalAlignment="center">
    
      <!-- pieTextField() --> 
      <Label cssClass="nsTaskPie-text" />
      
      <!-- pieSubTextField() --> 
      <Label cssClass="nsTaskPie-subText" />
    </StackLayout>
    
    <!-- descriptionField() -->
    <Label cssClass="nsTaskPie-description"
           col="0" row="1" />
           
    <!-- categoryGrid() --> 
    <GridLayout cssClass="nsTaskPie-categories"
                rows="*" columns="*,*,*,*">
                
      <!-- [0] "Not started" -->
      <StackLayout cssClass="nsTaskPie-category"
                   row="0" col="0">
                   
        <Border cssClass="nsTaskPie-border"
                backgroundColor="#ffc90e"
                horizontalAlignment="stretch" />
        
        <Label cssClass="nsTaskPie-count"
               horizontalAlignment="stretch"
               text="0" textWrap="true" />
        
        <Label cssClass="nsTaskPie-name"
               horizontalAlignment="stretch"
               text="Not started" textWrap="true" />
      </StackLayout>
      
      <!-- [1] "Late" -->
      <StackLayout cssClass="nsTaskPie-category"
                   col="1" row="0">
                   
        <Border cssClass="nsTaskPie-border"
                backgroundColor="#d54130"
                horizontalAlignment="stretch" />
        
        <Label cssClass="nsTaskPie-count"
               horizontalAlignment="stretch"
               text="0" textWrap="true" />
        
        <Label cssClass="nsTaskPie-name"
               horizontalAlignment="stretch"
               text="Late" textWrap="true" />
      </StackLayout>
      
      <!-- [2] "In progress" -->
      <StackLayout cssClass="nsTaskPie-category"
                   col="2" row="0">
                   
        <Border cssClass="nsTaskPie-border"
                backgroundColor="#4cabe1"
                horizontalAlignment="stretch" />
        
        <Label cssClass="nsTaskPie-count"
               horizontalAlignment="stretch"
               text="0" textWrap="true" />
        
        <Label cssClass="nsTaskPie-name"
               horizontalAlignment="stretch"
               text="In progress" textWrap="true" />
      </StackLayout>
      
      <!-- [3] "Completed" -->
      <StackLayout cssClass="nsTaskPie-category"
                   col="3" row="0">
                   
        <Border cssClass="nsTaskPie-border"
                backgroundColor="#88be39"
                horizontalAlignment="stretch" />
        
        <Label cssClass="nsTaskPie-count"
               horizontalAlignment="stretch"
               text="0" textWrap="true" />
        
        <Label cssClass="nsTaskPie-name"
               horizontalAlignment="stretch"
               text="Completed" textWrap="true" />
      </StackLayout>
    </GridLayout>
  </GridLayout>
</GridLayout>
```

## Dependency properties

| Name | Description | CSS class |
| ---- | --------- | --------- | --------- |
| categories | The custom category list. | --- |
| categoryStyle | CSS style for category area. | `nsTaskPie-categories` |
| description | The description (text under the pie). | --- |
| descriptionStyle | CSS style of the description. | `nsTaskPie-description` |
| pieGridStyle | CSS style of the grid tat contains the pie and its texts.  | `nsTaskPie-pieArea` |
| pieSize | The size the pie is drawed with. The highter the better is the quality, but needs more memory. Default: `300` | --- |
| pieStyle | CSS style of the pie image. | `nsTaskPie-pie` |
| pieSubText | The sub text of the pie. | --- |
| pieSubTextStyle | CSS style of the pie's sub text. | `nsTaskPie-subText` |
| pieText | The pie text. | --- |
| pieTextAreaStyle | CSS style of the area that contains the pie texts. | `nsTaskPie-textArea` |
| pieTextStyle | CSS style of the pie's text. | `nsTaskPie-text` |
