primitive data type always sudhu value check kore jokhon amra compare operator diye check kori.

ar non primitive data type jokhon compare kora hoy tokhon eta memory reference check kore. jodi 2 ta variable er memory reference same hoy taholei equal return kore otherwise always false return kore.

const obj1={
name:'Nahid',
age:26
}
const obj2={
name:'Nahid',
age:26
}

console.log(obj1===obj2) //false even if we check the value only by == operator.

because 2 ta object er reference alada jodio value same . tai ei non primitive data types compare korar somoy tader memory reference check kore. jehetu ekhane 2 ta object alada vabe create hoycche tai tader memory reference alada. so ei karonei tader inner value same thakar poreo comparison result false ashche.

if we do ,
const obj1={
name:"nahid'
}
const obj2={
prothomName:"nahid'
}

console.log(obj1.name==obj2.prothomName)// true
console.log(obj1.name===obj2.prothomName)// true

ekhane amra 2 ta alada alada object er ekta specific key er value check korchi. jodio 2 ta key er nam alada .ekta name arekta prothomName.kintu amra jodi ektu valo vabe kheyal kori tahole dekhbo amra kintu ei key gulaar value ke compare korchi. ar value 2tai kintu string. ar string holo ekta primitive value.ar primitive value kintu shob shomoy sudhu value check kore jokhon amra compare operator diye check kori. tai jehetu 2tai string value and tader value same tai true ashche result.

one more case.

const obj1={
name:'nahid'
}
const obj2=obj1
console.log(obj1==obj2) //true
console.log(obj1===obj2) //true

eibar amra obj2 er value te obj1 ke assign korechi. er mane javascript jokhon obj2 er kono properly niye kaj korbe tokhon value hisbe obj1 er reference ke use korbe.tar mane obj1 er value memory r jekhane assign kora hoyeche othoba obj1 er value reference jekhane ache shetai holo obj2 er value reference. tai amra jokhon 2ta non primitive ke compare korchi, tokhon tader reference same howar karonei comparison result true esheche ashche.

ekhon amra jodi obj2.name='wadoood' kori tahole amra dekhbo obj1 er name value tao change hoye giyeche. that means ekta single reference 2ta obj er moddhe share hoyeche

amra jodi ei same example ta array diye dekhi tahole shekhaneo amra same result dekhte pabo karon array o ekta non primitive data types.

const names1=['nahid','bin','wadood']
const names2=['nahid','bin','wadood']

console.log(names1==names2) //false
console.log(names1===names2) //false

const names1=['nahid','bin','wadood']
const names2=names1

console.log(names1==names2) //true
console.log(names1===names2) //true

=====================================

shallow copy, deep copy.

const obj1={
name:'nahid'
age:25
}

const obj2={...obj1}

ekhane amra obj2 er moddhe obj1 er ekta clone enechi ar amra ekhon chaile obj2 ke modify korte parbo jekhane obj1 er value r kono poriborton hobe na. kintu somossha hobe jokhon object er moddhe arekta object thake orthat, non primitives er moddhe jokhon arekta non primitive data thake such as==>

const obj1={
name:'nahid'
jobs:{
office:{
dhaka:'mohammadpur'
chittagong:'kulshi'
}
}
}

const obj1={...obj1}

tahole amra hoyto guess korte pari je ekhon 2ta alada alada object alada alada refence e ache.kintu non primitives data type er moddhe jodi arekta non primitive thake (array r moddhe array othobar object er moddhe object) tahole javascript shallow copy kora somoy vitorer non primitive datar reference ke rekhe dey shetar value hishabe.

ekhane amra uporer example ta te dekhle amra dekhbo shetar moddhe kono nested object othobar array chilo na.tai ob2 puropuri copy hoyeche. and obj2 er value change korar poreo obj1 er valuer kono change ashe ni and eta safe.

kintu 2nd example e amra dekhte pari je sheta object er moddhe kichu nested object ache , tai amra jokhon obj1 ke obj2 er moddhe spread korechi tokhon eta sudhu upper layer er value gulo ke copy koreche and jekhane again non primitive data peyeche sekhane notun reference e assign korar bodole ager valuer reference rekhe dey.

arektu sohoj vabe bolle, object er moddhe object bad diye baki value gulo ke copy kore eneche, kintu object er moddhe jei notun object chilo(jobs) shetake she obj1 er reference ei rekheche.

tai amra jodi obj2 er jober moddhe kono change kori tahole dekha jabe obj1 er value o change hoye giyeche.

`etai holo shallow copy. non primitive bad e baki shob primitive value gulo ke alada vabe reference kore.`

for the deep copy-->

we need to spread the inner object too.
like,

const obj2 = {
...obj1,
jobs: {
...obj1.jobs,
office: {
...obj1.jobs.office
}
}
};

for better thing, we can use the stucturedClone(obj/array)

=============================================================================

Object.freeze(obj) use korle object ke add /update/ delete kichui kora jay na

##what is Singleton vs non-singleton object.

give example of singletone object and what problem it solves with proper example.
give explanation of non singletone object and why this is benificial .
where we should use the singletone object and where not to use. same for the non singleton object.

object literal is= {
name:'nahid'
}

literal just a syntax of explanation of data types are written. so "" is string literal, 24 will be number literal, false will be boolean literal, [] array literal.

stack memory te  primitive data gulo store hoy and heap memory te non primitive data types er reference create hoy.

lexical position or lexical index holo kono ekta code ,kono specific file er koto number line e ache shetar declaration.


##what is lexical scope.
##what is Global Execution Context. 
##what are the phases of Global Execution context or any code execution context.

