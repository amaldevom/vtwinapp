import * as React from 'react';
import  * as lodash from 'lodash';
import styles from '../propertyFields.module.scss';

import { IPropertyFieldTechnologyPropsInternal } from './propertyFieldTechnology';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { ITechnology } from '../../webparts/msCustomLearning/models/IModels';

export interface IPropertyFieldTechnologyHostProps extends IPropertyFieldTechnologyPropsInternal{}
export interface IPropertyFieldTechnologyState{
    currentValue?: ITechnology[];
}

export default class PropertyFieldTechnologyHost extends React.Component<IPropertyFieldTechnologyHostProps, IPropertyFieldTechnologyState> {   
    public constructor(props: IPropertyFieldTechnologyHostProps){
        super(props);

        this.state = ({currentValue: this.props.initialValue} as IPropertyFieldTechnologyState);
    }

    @autobind
    private notifyChange(newValue: ITechnology[]){
        if(newValue != null){
            this.props.properties[this.props.targetProperty] = newValue;
            this.props.onPropertyChange(this.props.targetProperty, this.state.currentValue, newValue);
            this.setState({currentValue: newValue});
            if (typeof this.props.onChanged !== "undefined")
                this.props.onChanged(this.props.targetProperty, newValue);
        }
    }

    @autobind
    private _onCheckboxChanged(ev: React.FormEvent<HTMLElement>, isChecked: boolean): void {
        var itemKey: string = ev.currentTarget.attributes["aria-describedby"].value;
        var tech: string;
        var subject: string;
        var techIndex: number;
        var newValue: ITechnology[];

        tech = itemKey;
        if(itemKey.indexOf("-")>0){
            tech = itemKey.split("-")[0];
            subject = itemKey.split("-")[1];
        }
        newValue = lodash.cloneDeep(this.state.currentValue);
        if(subject == null){
            if(isChecked){
                techIndex = lodash.findIndex(this.props.displayValues, o => (o.Name === tech));
                if(techIndex > -1)
                    newValue.push(this.props.displayValues[techIndex]);
            }else{
                techIndex = lodash.findIndex(newValue, o => (o.Name == tech));
                if(techIndex > -1)
                newValue.splice(techIndex,1);
            }
            this.notifyChange(newValue);
        }else{
            techIndex = lodash.findIndex(newValue, o => (o.Name === tech));
            if(techIndex > -1){
                if(isChecked)
                newValue[techIndex].Subjects.push(subject);
                else{
                    var subjectIndex: number = newValue[techIndex].Subjects.indexOf(subject);
                    newValue[techIndex].Subjects.splice(subjectIndex,1);
                }
                this.notifyChange(newValue);
            }
        }
    }

    @autobind
    private _currentState(tech: string, subject: string): boolean{
        var exists: ITechnology;
        if(!subject){
            exists = lodash.find(this.state.currentValue, o => (o.Name === tech));
            return (exists != undefined);
        }else{
            exists = lodash.find(this.state.currentValue, o => (o.Name === tech));
            if(exists){
                var existsSubject = lodash.find(exists.Subjects, o => (o === subject));
                return (existsSubject != undefined);
            } else {
                return false;
            }
        }
    }
   
    public render(): JSX.Element {
        return (
            <div className={styles.group}>
                <Label>{this.props.label}</Label>
                { this.props.displayValues && this.props.displayValues.length > 0 &&
                this.props.displayValues.map((tech: ITechnology) => {
                    return(
                        <div className={styles.group}>
                            <Checkbox
                                label={tech.Name}
                                ariaDescribedBy={`${tech.Name}`}
                                onChange={this._onCheckboxChanged}
                                checked={this._currentState(tech.Name, null)}
                            />
                            { tech.Subjects.length > 0 && 
                            tech.Subjects.map((subject: string) => {
                                return(
                                    <div className={styles.subject}>
                                        <Checkbox 
                                            label={subject}
                                            ariaDescribedBy={`${tech.Name}-${subject}`}
                                            onChange={this._onCheckboxChanged}
                                            checked={this._currentState(tech.Name, subject)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }
}