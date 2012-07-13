//Renames the item without the stupid (Clone) tag when it is instantiated
var nameWithoutCloneAdded : String;

function Awake () {
gameObject.name = nameWithoutCloneAdded;
}