// credits: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path, 
// https://stackoverflow.com/users/1955088/adriano-spadoni
const setPath = (object, path, value) => 
    path
   .split('.')
   .reduce((o,p,i) => o[p] = path.split('.').length === ++i ? value : o[p] || {}, object)

const resolvePath = (object, path, defaultValue) => 
    path
   .split('.')
   .reduce((o, p) => o ? o[p] : defaultValue, object)

const uiElements = [];

export function updateUI() {
    uiElements.forEach(refresh => refresh());
}

export function bindCheckBox(obj, elementName, propertyName, onSet) {
    const element = document.getElementById(elementName);
    element.addEventListener("click", () => {
        setPath(obj, propertyName, element.checked);
        if (onSet) {
            onSet();
        }
    });
    uiElements.push( () => element.checked = resolvePath(obj, propertyName));
}

export function bindNumberProperty(obj, elementName, propertyName, onSet) {
    const element = document.getElementById(elementName);
    element.addEventListener("change", 
        () => updateNumberField(element, 
                (v) => { 
                    setPath(obj, propertyName, v);
                    if (onSet) {
                        onSet();
                    }
                 }, 
                 () => resolvePath(obj, propertyName)));    
    uiElements.push( () => element.value = resolvePath(obj, propertyName));
}

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
