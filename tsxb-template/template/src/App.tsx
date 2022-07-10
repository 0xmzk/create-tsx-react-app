import React, { Dispatch, SetStateAction, useState } from 'react'

interface User {
    id: number;
    name: string;
    readonly hello: string;
    sayHello(): void;
}

class Me implements User {
    id: number;
    name: string;
    age: number;
    setAge: Dispatch<SetStateAction<number>>;
    readonly hello: string = "Hello World";

    constructor(id: number, name: string, ageState: [number, Dispatch<SetStateAction<number>>]) {
        this.id = id;
        this.name = name;
        const [age, setAge] = ageState;
        this.age = age;
        this.setAge = setAge;
    }

    sayHello(): string {
        return this.hello;
    }
}

function App() {
    let anInstanceOfMe: Me = new Me(0, 'Mike', useState(18))

    // @ts-ignore
    const [user, setUser] = useState<Me>(anInstanceOfMe)
    return (
        <>
            <div>My age: {anInstanceOfMe.age}</div>
            <button
                onClick={() => {
                    anInstanceOfMe.setAge(anInstanceOfMe.age + 1);
                }}
            >
                Click me!</button>
        </>
    )
}

export default App