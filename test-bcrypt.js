import bcrypt from 'bcryptjs';

async function test() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Hash length:', hash.length);

    const isValid = await bcrypt.compare(password, hash);
    console.log('Comparison result:', isValid);

    // Test with wrong password
    const wrongValid = await bcrypt.compare('wrongpassword', hash);
    console.log('Wrong password result:', wrongValid);
}

test();
