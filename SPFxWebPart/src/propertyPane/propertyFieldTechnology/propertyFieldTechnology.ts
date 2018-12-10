import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
} from '@microsoft/sp-webpart-base';
import PropertyFieldTechnologyHost, { IPropertyFieldTechnologyHostProps } from './PropertyFieldTechnologyHost';
import { ITechnology } from '../../webparts/msCustomLearning/models/IModels';

export interface IPropertyFieldTechnologyProps {
  label: string;
  initialValue: ITechnology[];
  displayValues: ITechnology[];
  placeHolder?: string;
  onPropertyChange(propertyPath: string, oldValue: any, newValue: any): void;
  render(): void;
  disableReactivePropertyChanges?: boolean;
  properties?: any;
  key?: string;  
  disabled?: boolean;
  onGetErrorMessage?: (value: string) => string | Promise<string>;
  deferredValidationTime?: number;
}

export interface IPropertyFieldTechnologyPropsInternal extends IPropertyFieldTechnologyProps{
  label: string;
  initialValue: ITechnology[];
  displayValues: ITechnology[];
  placeHolder?: string;
  targetProperty: string;
  onDispose(elem: HTMLElement): void;
  onRender(elem: HTMLElement, ctx, changeCallback): void;
  onChanged(targetProperty: string, value: any): void;
  onPropertyChange(propertyPath: string, oldValue: any, newValue: any): void;
  render(): void;
  disableReactivePropertyChanges?: boolean;
  properties: any;
  disabled?: boolean;
  onGetErrorMessage?: (value: string) => string | Promise<string>;
  deferredValidationTime?: number; 
}

class PropertyFieldTechnologyBuilder implements IPropertyPaneField<IPropertyFieldTechnologyPropsInternal>{
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyFieldTechnologyPropsInternal;

  //Custom properties
  private label: string;
  private initialValue: ITechnology[];
  private displayValues: ITechnology[];
  private placeHolder: string;
  private onPropertyChange: (propertyPath: string, oldValue: any, newValue: any) => void;
  private customProperties: any;
  private key: string;
  private disabled: boolean = false;
  private onGetErrorMessage: (value: string) => string | Promise<string>;
  private deferredValidationTime: number = 200;
  private renderWebPart: () => void;
  private disableReactivePropertyChanges: boolean = false;

  public constructor(_targetProperty: string, _properties: IPropertyFieldTechnologyPropsInternal){
      this.render = this.render.bind(this);
      this.targetProperty = _properties.targetProperty;
      this.properties = _properties;
      this.label = _properties.label;
      this.initialValue = _properties.initialValue;
      this.displayValues = _properties.displayValues;
      this.properties.onDispose = this.dispose;
      this.properties.onRender = this.render;
      this.onPropertyChange = _properties.onPropertyChange;
      this.customProperties = _properties.properties;
      this.key = _properties.key;
      if (_properties.disabled === true)
      this.disabled = _properties.disabled;
      this.onGetErrorMessage = _properties.onGetErrorMessage;
      if (_properties.deferredValidationTime !== undefined)
      this.deferredValidationTime = _properties.deferredValidationTime;
      this.placeHolder = _properties.placeHolder;
      this.renderWebPart = _properties.render;
      if (_properties.disableReactivePropertyChanges !== undefined && _properties.disableReactivePropertyChanges != null)
      this.disableReactivePropertyChanges = _properties.disableReactivePropertyChanges;
  }

  private render(elem: HTMLElement, ctx?, changeCallback?: (targetProperty: string, value: any) => void): void {
      const element: React.ReactElement<IPropertyFieldTechnologyHostProps> = React.createElement(PropertyFieldTechnologyHost,{
          label: this.label,
          initialValue: this.initialValue,
          displayValues: this.displayValues,
          placeHolder: this.placeHolder,
          targetProperty: this.targetProperty,
          onDispose: this.dispose,
          onRender: this.render,
          onChanged: changeCallback,
          onPropertyChange: this.onPropertyChange,
          properties: this.customProperties,
          key: this.key,
          disabled: this.disabled,
          onGetErrorMessage: this.onGetErrorMessage,
          deferredValidationTime: this.deferredValidationTime,
          render: this.renderWebPart,
          disableReactivePropertyChanges: this.disableReactivePropertyChanges
      });
      ReactDom.render(element,elem);
  }

  private dispose(elem: HTMLElement): void {
  }
}

export function PropertyPaneTechnology(targetProperty: string, properties: IPropertyFieldTechnologyProps):IPropertyPaneField<IPropertyFieldTechnologyPropsInternal>{
  var newProperties: IPropertyFieldTechnologyPropsInternal = {
      label: properties.label,
      targetProperty: targetProperty,
      placeHolder: properties.placeHolder,
      initialValue: properties.initialValue,
      displayValues: properties.displayValues,
      onPropertyChange: properties.onPropertyChange,
      properties: properties.properties,
      onDispose: null,
      onRender: null,
      onChanged: null,
      key: properties.key,
      disabled: properties.disabled,
      onGetErrorMessage: properties.onGetErrorMessage,
      deferredValidationTime: properties.deferredValidationTime,
      render: properties.render,
      disableReactivePropertyChanges: properties.disableReactivePropertyChanges
  };
  return new PropertyFieldTechnologyBuilder(targetProperty,newProperties);
}