// various utilities to help out with the UI 

/**
 * General configuration used by different functions
 */
export const config = {
    /** 
     * Function which will be called after a value of a bound ui-elements has been changed
     */
    defaultPostUpdateFunction : null,

    /**
     * Current object which the properties will be bound to ui-elements
     */
    defaultBindingObject: null
}

/** Ui elements which have been associated with certain properties and need to be updated from time to time */
const uiRefreshFunctions = [];

/**
 * Starts binding by setting the default object and postupdate. Not necessary but makes subsequent binding calls slightly easier. 
 * @param {any} obj the object of which the properties will be changed
 * @param {function} defaultPostUpdate a function with the signature func() called after an update to a property
 */
export function beginPropertyBinding(obj, defaultPostUpdate) {
    config.defaultBindingObject = obj;

    if (defaultPostUpdate) {
        config.defaultPostUpdateFunction = defaultPostUpdate;
    }
}

/**
 * Clears this config's postupdate and default binding object.
 */
export function endPropertyBinding() {
    config.defaultBindingObject = null;
    config.defaultPostUpdateFunction = null;
}


/**
 * Set the value of a property of the given object
 * @param {any} object the object owning the property to change  
 * @param {string} path to the property to change
 * @param {any} value new value of the property
 * @returns 
 */
// credits: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path, 
// https://stackoverflow.com/users/1955088/adriano-spadoni
const setPath = (object, path, value) => 
    path.split('.').reduce((o,p,i) => o[p] = path.split('.').length === ++i ? value : o[p] || {}, object)


/**
 * Gets the value of the a property of the given object
 * @param {any} object owning the property
 * @param {string} path to the property to return
 * @param {any} defaultValue returned if the property is undefined
 * @returns 
 */
const resolvePath = (object, path, defaultValue) => 
    path.split('.').reduce((o, p) => o ? o[p] : defaultValue, object)


/** Calls all refresh functions on all bound ui objects */   
export function updateUI() {
    uiRefreshFunctions.forEach(refresh => refresh());
}

/**
 * Bind the property of the given object to the checked value of the 
 * checkbox ui element 
 * @param {*} obj 
 * @param {*} checkboxName 
 * @param {*} propertyName 
 * @param {*} onSet 
 */
export function bindBooleanProperty({obj, checkboxName, property, onSet}) {
    const element = document.getElementById(property || checkboxName);
    const postUpdate = config.defaultPostUpdateFunction;

    obj = obj || config.defaultBindingObject;

    element.addEventListener("click", () => {
        setPath(obj, property, element.checked);
       
        if (onSet) {
            onSet();
        }

        if (postUpdate) {
            postUpdate();
        }
    });
    uiRefreshFunctions.push( () => {
        element.checked = resolvePath(obj, property);
    });
}

/**
 * Bind the number input ui element to the property of the given object 
 * @param {*} obj 
 * @param {*} numberInput 
 * @param {*} propertyName 
 * @param {*} onSet called after the value has changed
 */
export function bindNumberProperty({obj, numberInput, property, onSet}) {
    const element = document.getElementById(numberInput || property);
    const postUpdate = config.defaultPostUpdateFunction;

    obj = obj || config.defaultBindingObject;
    
    if (!element) {
        console.log(`cannot resolve uiElement with names: ${numberInput} or ${property}.`)
    }

    element.addEventListener("change", 
        () => updateNumberField(element, 
                (v) => { 
                    setPath(obj, property, v);
                                       
                    if (onSet) {
                        onSet();
                    }

                    if (postUpdate) {
                        postUpdate();
                    }
 
                 }, 
                 () => resolvePath(obj, property)));    
    uiRefreshFunctions.push( () => {
        element.value = resolvePath(obj, property);
    });
}

/**
 * Binds a vector property of the given object to the input field with the inputName
 */
 export function bindVectorProperty({obj, property, inputName, onSet, postFixCharacters="xyz"}) {
    inputName = inputName  || property;

    for (let i = 0; i < postFixCharacters.length; i++) {
        const postFixChar = postFixCharacters[i];
        bindNumberProperty({obj, numberInput: `${inputName}.${postFixChar}`, property: `${property}.${postFixChar}`, onSet});
    }
}

/**
 * Binds a color property of the given object to the input field with the inputName
 */
export function bindColorProperty({obj, property, inputName, onSet, postFixCharacters="rgb"}) {
    bindVectorProperty({obj, property, inputName, onSet, postFixCharacters});
}

/**
 * Parses the value in a number input field and assigns it via setValue
 * @param {*} inputField 
 * @param {*} setValue function changing the value of the object to which the inputField is mapped
 * @param {*} getValue function returning the original value
 */
function updateNumberField(inputField, setValue, getValue) {
    try {
        var newValue = parseFloat(inputField.value);
        if (!Number.isNaN(newValue))
        {
            if (newValue !== getValue()) {
                setValue(newValue);
            }
        } else {
            inputField.value = getValue();
        }
        
    } catch (error) {
        inputField.value = getValue();
        console.log(`error while updating number: ${error}`);
    }
}
