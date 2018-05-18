## CSCI 4140 Project
### WhereToEat

a react native android app

run "npm install"

debug according to this https://github.com/oblador/react-native-progress/issues/67 which is changing:

{formatText(progressValue)}

in line 187 at Circle.js (node_modules\react-native-progress\Circle.js) to

{progress ? formatText(progress._value) : this.forceUpdate()}

run "react-native run-android"


URL https://github.com/jkclee123/WhereToEat
Latest Commit: 1 parent 2cb88fd commit f11ebe1b715909e34ad7118489e8a9eeff6b60b8
