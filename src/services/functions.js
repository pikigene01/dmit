
let phone_pattern  = /^[.+\+.+][0-9]*$/;//this test will test user_id not to include letters
let email_pattern  =  /^.+\@.+$/;//this test will test email
let letters_and_numbers_pattern  =  /^[a-zA-Z0-9 ]*$/;//this test will test letters and numbers

export const testPatternPhone = async (phone)=>{
    let response = false;
    if (phone_pattern.test(phone)) {
    response = true;
    }else{
   response = false;
    }
    return await response;
}
export const testPatternEmail = async (phone)=>{
    let response = false;
    if (email_pattern.test(phone)) {
    response = true;
    }else{
   response = false;
    }
    return await response;
}
export const testPatternLettersNumbers = async (phone)=>{
    let response = false;
    if (letters_and_numbers_pattern.test(phone)) {
    response = true;
    }else{
   response = false;
    }
    return await response;
}