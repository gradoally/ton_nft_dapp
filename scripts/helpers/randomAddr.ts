import { Address } from 'ton-core';
import { pseudoRandomBytes } from 'crypto';

export function randomAddress() : Address {
	return new Address(0, pseudoRandomBytes(256 / 8));
}