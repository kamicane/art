/*
---
name: Fx.Step
description: "It ♥s ART, over time"
requires: [Fx, Fx/CSS, Color/Color, ART]
provides: [Fx/Step]
...
*/

(function(){

this.Fx.Step = new Class({ // tweening for attrs & functions with support for macros and SVG paths
        Extends: Fx,
        initialize: function(element, options){
            this.element = element;
            this.parent(options);
            if( (!this.options.attribute) && (!this.options.setter)) this.options.setter = 'centroidScaleTo';
        },
        set: function(now){
            if(this.options.setter){
                if(typeOf(this.options.setter) == 'function'){
                    if(this.options.args){
                        var argsv = [];
                        now = this.serve(now);
                        if(typeOf(now) == 'array' && now.length == 1) now = now[0];
                        this.options.args.each(function(arg){
                            argsv.push(now[arg]);
                        }.bind(this));
                        var context = this.options.bind?this.options.bind:this;
                        this.options.setter.apply(context, argsv)
                    }else{
                        now = Math.floor(this.serve(now)*1000)/1000;
                        this.options.setter(now);
                    }
                }else{
                    if(this.options.args){
                        var argsv = [];
                        now = this.serve(now);
                        this.options.args.each(function(arg){
                            argsv[arg] = now[arg];
                        }.bind(this));
                        var context = this.options.bind?this.options.bind:this;
                        if(this.element[this.options.setter]) this.element[this.options.setter].apply(context, argsv);
                        else if(window[this.options.setter]) window[this.options.setter].apply(context, argsv);
                    }else{
                        now = Math.floor(this.serve(now)*1000)/1000;
                        if(this.element[this.options.setter]) this.element[this.options.setter](now);
                        else if(window[this.options.setter]) window[this.options.setter](now);
                    }
                }
            }else{
                if(this.options.attribute){
                    this.element.setAttribute(this.options.attribute, this.serve(now));
                }
            }
            return now;
        },
        serve: function(value, unit){
            if (typeOf(value) != 'fx:step:value'){
                if(typeOf(value) == 'array'){
                    return value[0];
                }else return value;
            }
            var returned = [];
            value.each(function(bit){
                returned = returned.concat(bit.parser.serve(bit.value, unit));
            });
            return returned;
        },
        parse: function(value){
            value = Function.from(value)();
            //this is a composite path do not rando tokenize
            //todo: functions ex: transform
            if(typeOf(value) == 'object' || value.test && value.test(/^([A-Za-z]( [0-9]+ [0-9]+){1,} ?){1,}$/g) ) value = [value];
            else value = (typeof value == 'string') ? value.split(' ') : Array.from(value);
            return value.map(function(val){
                if(typeOf(val) != 'object') val = String(val);
                else val = JSON.encode(val);
                var found = false;
                Object.each(Fx.Step.Parsers, function(parser, key){
                    if (found) return;
                    var parsed = parser.parse(val);
                    if (parsed || parsed === 0) found = {value: parsed, parser: parser};
                });
                found = found || {value: val, parser: Fx.Step.Parsers.String};
                return found;
            });
        },
        render: function(){
            
        },
        compute: function(from, to, delta){
            from = this.parse(from);
            to = this.parse(to);
            if(typeOf(from) == 'array'){
                var computed = [];
                (Math.min(from.length, to.length)).times(function(i){
                    computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
                });
                computed.$family = Function.from('fx:step:value');
                return computed;
            }else return this.parent(from, to, delta);
        },
    });
    Fx.Step.Parsers = {
        Color : Fx.CSS.Parsers.Color,
        'Number' : Fx.CSS.Parsers.Number,
        'Transform' : {
            parse: function(value){
                return false;
            },
            compute: function(zero, one){
                return one;
            },
            serve: function(zero){
                return zero;
            }
        },
        'Object' : {
            parse: function(value){
                try{
                    var data = JSON.decode(value);
                    return data;
                }catch(ex){
                    return false;
                }
                //return typeOf(value) == 'object'?value:false;
            },
            compute: function(old_object, new_object, delta){
                var results = {};
                Object.each(old_object, function(value, key){
                    if(new_object[key]) results[key] = Fx.compute(value, new_object[key], delta);
                });
                return results;
            },
            serve: function(value){
                if(typeOf(value) == 'array' && value.length == 1) value = value[0];
                return value;
            }
        },
        'Path' : {
            parse: function(value){
                 var result = [];
                 if(!value.test(/^([A-Za-z]( [0-9]+ [0-9]+){1,} ?){1,}$/g)) return false;
                 var parts = value.split(/(?=[A-Za-z])/);
                 parts.each(function(part){
                    result.push(part.split(' '));
                 });
                 return (result.length == 0)?false:result;
            },
            compute: function(old_path, new_path, delta){
                //console.log('compute', old_path, new_path, delta);
                var new_path_item;
                var path = [];
                old_path.each(function(old_path_item, index){
                    new_path_item = new_path[index];
                    if(old_path_item[0] == new_path[index][0]){
                        var path_node = [];
                        path_node.push(old_path_item[0]);
                        if(old_path_item.length >= 3){ //two args
                            path_node.push(Math.floor(Fx.compute(Number.from(old_path_item[1]), Number.from(new_path_item[1]), delta)));
                            path_node.push(Math.floor(Fx.compute(Number.from(old_path_item[2]), Number.from(new_path_item[2]), delta)));
                        }
                        if(old_path_item.length >= 5){ //four args
                            path_node.push(Math.floor(Fx.compute(Number.from(old_path_item[3]), Number.from(new_path_item[3]), delta)));
                            path_node.push(Math.floor(Fx.compute(Number.from(old_path_item[4]), Number.from(new_path_item[4]), delta)));
                        }
                        if(old_path_item.length >= 7){ //six args
                            path_node.push(Math.floor(Fx.compute(Number.from(old_path_item[5]), Number.from(new_path_item[5]), delta)));
                            path_node.push(Math.floor(Fx.compute(Number.from(old_path_item[6]), Number.from(new_path_item[6]), delta)));
                        }
                        path.push(path_node);
                    }else{
                        //transition from one line type to another
                    }
                });
                return path;
            },
            serve: function(path){
                var value = '';
                path.map(function(node){
                    value += node.join(' ');
                });
                return value;
            },
            diff : function(old_path, new_path){
                
            }
        },
        'String' : Fx.CSS.Parsers.String
    }
    Fx.Step.Parsers.String.serve = function(value){
        if(typeOf(value) == 'array') return value[0];
        else return value;
    }
    Fx.Step.Parsers.Color.serve = Fx.Step.Parsers.String.serve;
    Fx.Step.Parsers.Number.serve = Fx.Step.Parsers.String.serve;
})();

