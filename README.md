# graphql-archer
(Concept): Node cli for generating an Apollo server and bootstrapping your schema.

## Concept
```sh
$ graphql-archer create example-app
- 🏹 Creating application "example-app"
[?] Do you want to use *yarn* or *npm*?
 > Yarn
   NPM

- Installing packages...
- Done! 🏹

$ cd ./example-app
$ graphql-archer g type
- 🏹 Generate a GraphQL type

[?] Please choose one:
 > Object Type
   Input Type
   Enum Type
   Union Type
   Scalar
   
[?] 🏹 Give your new *Object Type* a name:
 Name: MyObject
   
[?] 🏹 Describe *MyObject*:
 Description: It's my object yo...

[?] Type: MyObject (Aerdh)
- Fields: (none)
   A) Add new field
   e) Modify a field
   r) Remove a field
   f) Finish
   h) Help
$ A...

[?] Enter field name: ... theTitle

- MyObject > theTitle
[?] Choose a type kind for this field:
   > * String
     * ID
     * Integer
     * Float
     * Boolean
     + MyObject

  ( ) Nullable    (•) Non-nullable   ( ) Nullable List   ( ) Non-nullable List

- MyObject > theTitle (String!)
[?] Describe this field: ... It's the title yo!

- Generating ./graphql/types/MyObject.js
  Name: MyObject
  Description: It's my object yo...
  Fields:
  ------------------------------------------
  name       | description         | type
  ------------------------------------------
  theTitle   | It's the title yo!  | String!
  ------------------------------------------
 
- Done! 🏹
```

### Packages to use:
- apollo-server
- create-index

## Todo
- [Commander.js](https://github.com/tj/commander.js/)
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#documentation)
