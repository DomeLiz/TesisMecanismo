//llamara a todos los modelos 
const { Person, PersonSchema } = require ('./persons.model');

function setupModels(sequelize) {
    Person.init(PersonSchema,Person.config(sequelize));
}

module.exports = setupModels;
