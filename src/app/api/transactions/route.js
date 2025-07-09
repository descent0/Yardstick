  
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Transaction from '@/model/Transaction';

export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find().sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { amount, date, description } = await request.json();

    if (!amount || !date || !description || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await dbConnect();
    const transaction = await Transaction.create({ amount, date, description });

    return NextResponse.json({ id: transaction._id, message: 'Transaction created successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, amount, date, description } = await request.json();

    if (!id || !amount || !date || !description || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await dbConnect();
    const updated = await Transaction.findByIdAndUpdate(
      id,
      {
        amount,
        date,
        description: description.trim(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
