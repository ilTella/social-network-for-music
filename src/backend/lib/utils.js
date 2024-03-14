import crypto from "crypto"

export function hash(input) {
    return crypto.createHash('md5')
        .update(input)
        .digest('hex');
}

export function isValidString(string) {
    if (string == undefined || typeof string != "string" || string.trim().length == 0) {
        return false;
    }
    return true;
}

export function isValidList(list) {
    if (list == undefined || !(list instanceof Array) || list.length == 0) {
        return false;
    }
    return true;
}

export function isValidPassword(password) {
    return (isValidString(password) && password.length >= 8)
}

export function isValidEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (isValidString(email) && regex.test(email));
}