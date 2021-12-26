import ky from "https://cdn.skypack.dev/ky?dts";

let test: any = await ky.get("http://localhost:3000/ready").json();
console.log(test.satate);
