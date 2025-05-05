import React from 'react';
import { Button } from '@/components/ui/button';

const TimeTable = () => {
    return (
        <div className='flex'>
            <div className='w-full h-20 px-4 flex justify-between items-center'>
                <h3 className='text-2xl font-bold'>Time Table Management</h3>
                <Button >Edit Time Table</Button>
            </div>
        </div>
    )
}

export default TimeTable;
