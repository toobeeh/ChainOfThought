import {ethers} from "ethers";

export function toBytesN(input: string, n: number): string {
    let bytes = ethers.toUtf8Bytes(input);

    if (bytes.length > n) {
        bytes = bytes.slice(0, n);
    } else if (bytes.length < n) {
        const padded = new Uint8Array(n);
        padded.set(bytes);
        bytes = padded;
    }

    return ethers.hexlify(bytes);
}