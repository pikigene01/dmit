export const randomcolor = (length)=>{
    let result = '';
    let colornumbers = "1234567890987654321";
    const colorslength = colornumbers.length;
    let counter = 0;
    while (counter < length){
        result += colornumbers.charAt(Math.floor(Math.random() * colorslength));
        counter += 1;
    }

     let createColor = `#${result}`;

     return createColor.toString();
}