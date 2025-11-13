# On the Subject of Crypto

In this module you have to decrypt a code and input the correct solution.<br/>
To decrypt the code however, you will need the key.<br/>

## Calculating the Key

Start with zero, then for every port on the bomb, you'll need to add a number.
Finally take the sum and calculate it mod 26, that's the key.

| Port           | Number to Add                                                                     |
|----------------|-----------------------------------------------------------------------------------|
| **DVI-D**      | The sum of the digits in the serial number                                        |
| **Parallel**   | The sum of the batteries                                                          |
| **PS/2**       | The amount of batteries                                                           |
| **RJ-45**      | The amount of modules                                                             |
| **Serial**     | The product of the amount of batteries and the sum of the values of the batteries |
| **Stereo RCA** | 5 if the serial number contains Q, X or Z else 4                                  |

## Decrypting the Code

Now that you have the key, you'll need to decrypt the code.
You can do this by shifting all letters in the code *[key]* places in the alphabet.
