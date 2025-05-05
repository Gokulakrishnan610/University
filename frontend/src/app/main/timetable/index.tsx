import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, RotateCcw, Plus } from 'lucide-react';

const TimeTable = () => {
    const [semester, setSemester] = useState('Winter Semester 2022 (Freshers)');

    return (
        <div className='flex flex-col w-full'>
            {/* Header section with semester and buttons */}
            <div className='w-full p-4 border-b'>
                <div className='flex justify-between items-center'>
                    <h3 className='text-xl font-semibold'>{semester}</h3>
                    <div className='flex gap-2'>
                        <Button variant="ghost">Clear</Button>
                        <Button variant="default" className='bg-green-600 hover:bg-green-700'>
                            <Plus className='mr-2 h-4 w-4' />
                            Add Course
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Toolbar with table options */}
            <div className='w-full p-4 flex justify-between items-center'>
                <div className='flex gap-2'>
                    <Button variant="default" className='bg-blue-600 hover:bg-blue-700'>
                        Default Table
                    </Button>
                </div>
                <div className='flex gap-2'>
                    <Button variant="default" className='bg-green-600 hover:bg-green-700'>
                        <Download className='mr-2 h-4 w-4' />
                        Download Timetable
                    </Button>
                    <Button variant="default" className=' hover:bg-yellow-600'>
                        <Eye className='mr-2 h-4 w-4' />
                        Enable Quick Visualization
                    </Button>
                    <Button variant="default" className='bg-red-600 hover:bg-red-700'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset Table
                    </Button>
                </div>
            </div>
            
            {/* Timetable grid */}
            <div className='w-full p-4 overflow-x-auto'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr>
                            <th className='border  p-2'></th>
                            <th className='border  p-2'>
                                <div className='text-center'>8:00 AM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>8:50 AM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>9:00 AM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>9:50 AM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>10:00 AM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>10:50 AM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>11:00 AM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>11:50 AM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>12:00 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>12:50 PM</div>
                            </th>
                            <th className='border  p-2 text-center'>LUNCH</th>
                            <th className='border  p-2'>
                                <div className='text-center'>2:00 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>2:50 PM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>3:00 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>3:50 PM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>4:00 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>4:50 PM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>5:00 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>5:50 PM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>6:00 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>6:50 PM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>6:51 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>7:00 PM</div>
                            </th>
                            <th className='border  p-2'>
                                <div className='text-center'>7:01 PM</div>
                                <div className='text-center'>to</div>
                                <div className='text-center'>7:50 PM</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>THEORY HOURS</td>
                            <td className='border p-2 text-center'>
                                <div>8:00 AM</div>
                                <div>to</div>
                                <div>8:50 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>9:00 AM</div>
                                <div>to</div>
                                <div>9:50 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>10:00 AM</div>
                                <div>to</div>
                                <div>10:50 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>11:00 AM</div>
                                <div>to</div>
                                <div>11:50 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>12:00 PM</div>
                                <div>to</div>
                                <div>12:50 PM</div>
                            </td>
                            <td className='border  p-2 text-center' rowSpan={7}>L<br/>U<br/>N<br/>C<br/>H</td>
                            <td className='border p-2 text-center'>
                                <div>2:00 PM</div>
                                <div>to</div>
                                <div>2:50 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>3:00 PM</div>
                                <div>to</div>
                                <div>3:50 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>4:00 PM</div>
                                <div>to</div>
                                <div>4:50 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>5:00 PM</div>
                                <div>to</div>
                                <div>5:50 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>6:00 PM</div>
                                <div>to</div>
                                <div>6:50 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>6:51 PM</div>
                                <div>to</div>
                                <div>7:00 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>7:01 PM</div>
                                <div>to</div>
                                <div>7:50 PM</div>
                            </td>
                        </tr>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>LAB HOURS</td>
                            <td className='border p-2 text-center'>
                                <div>08:00 AM</div>
                                <div>to</div>
                                <div>08:50 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>08:51 AM</div>
                                <div>to</div>
                                <div>09:40 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>09:51 AM</div>
                                <div>to</div>
                                <div>10:40 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>10:41 AM</div>
                                <div>to</div>
                                <div>11:30 AM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>11:40 AM</div>
                                <div>to</div>
                                <div>12:30 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>2:00 PM</div>
                                <div>to</div>
                                <div>2:50 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>2:51 PM</div>
                                <div>to</div>
                                <div>3:40 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>3:51 PM</div>
                                <div>to</div>
                                <div>4:40 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>4:41 PM</div>
                                <div>to</div>
                                <div>5:30 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>5:40 PM</div>
                                <div>to</div>
                                <div>6:30 PM</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>6:31 PM</div>
                                <div>to</div>
                                <div>7:20 PM</div>
                            </td>
                            <td className='border p-2 text-center'></td>
                        </tr>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>MON</td>
                            <td className='border p-2 text-center'>A1 / L1</td>
                            <td className='border p-2 text-center'>F1 / L2</td>
                            <td className='border p-2 text-center'>D1 / L3</td>
                            <td className='border p-2 text-center'>TB1 / L4</td>
                            <td className='border p-2 text-center'>TG1 / L5</td>
                            <td className='border p-2 text-center'>A2 / L31</td>
                            <td className='border p-2 text-center'>F2 / L32</td>
                            <td className='border p-2 text-center'>D2 / L33</td>
                            <td className='border p-2 text-center'>TB2 / L34</td>
                            <td className='border p-2 text-center'>TG2 / L35</td>
                            <td className='border p-2 text-center'>L36</td>
                            <td className='border p-2 text-center'>V3</td>
                        </tr>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>TUE</td>
                            <td className='border p-2 text-center'>B1 / L7</td>
                            <td className='border p-2 text-center'>G1 / L8</td>
                            <td className='border p-2 text-center'>E1 / L9</td>
                            <td className='border p-2 text-center'>TC1 / L10</td>
                            <td className='border p-2 text-center'>TAA1 / L11</td>
                            <td className='border p-2 text-center'>B2 / L37</td>
                            <td className='border p-2 text-center'>G2 / L38</td>
                            <td className='border p-2 text-center'>
                                <div>E2 / L39</div>
                                <div>BCHY101P</div>
                            </td>
                            <td className='border p-2 text-center'>
                                <div>TC2 / L40</div>
                                <div>BCHY101P</div>
                            </td>
                            <td className='border p-2 text-center'>TAA2 / L41</td>
                            <td className='border p-2 text-center'>L42</td>
                            <td className='border p-2 text-center'>V4</td>
                        </tr>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>WED</td>
                            <td className='border p-2 text-center'>C1 / L13</td>
                            <td className='border p-2 text-center'>A1 / L14</td>
                            <td className='border p-2 text-center'>F1 / L15</td>
                            <td className='border p-2 text-center'>V1 / L16</td>
                            <td className='border p-2 text-center'>V2 / L17</td>
                            <td className='border p-2 text-center'>C2 / L43</td>
                            <td className='border p-2 text-center'>A2 / L44</td>
                            <td className='border p-2 text-center'>F2 / L45</td>
                            <td className='border p-2 text-center'>TD2 / L46</td>
                            <td className='border p-2 text-center'>TBB2 / L47</td>
                            <td className='border p-2 text-center'>L48</td>
                            <td className='border p-2 text-center'>V5</td>
                        </tr>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>THU</td>
                            <td className='border p-2 text-center'>D1 / L19</td>
                            <td className='border p-2 text-center'>B1 / L20</td>
                            <td className='border p-2 text-center'>G1 / L21</td>
                            <td className='border p-2 text-center'>TE1 / L22</td>
                            <td className='border p-2 text-center'>TCC1 / L23</td>
                            <td className='border p-2 text-center'>D2 / L49</td>
                            <td className='border p-2 text-center'>B2 / L50</td>
                            <td className='border p-2 text-center'>G2 / L51</td>
                            <td className='border p-2 text-center'>TE2 / L52</td>
                            <td className='border p-2 text-center'>TCC2 / L53</td>
                            <td className='border p-2 text-center'>L54</td>
                            <td className='border p-2 text-center'>V6</td>
                        </tr>
                        <tr>
                            <td className='border  p-2 font-bold text-center'>FRI</td>
                            <td className='border p-2 text-center'>E1 / L25</td>
                            <td className='border p-2 text-center'>C1 / L26</td>
                            <td className='border p-2 text-center'>TA1 / L27</td>
                            <td className='border p-2 text-center'>TF1 / L28</td>
                            <td className='border p-2 text-center'>TD1 / L29</td>
                            <td className='border p-2 text-center'>E2 / L55</td>
                            <td className='border p-2 text-center'>C2 / L56</td>
                            <td className='border p-2 text-center'>TA2 / L57</td>
                            <td className='border p-2 text-center'>TF2 / L58</td>
                            <td className='border p-2 text-center'>TDD2 / L59</td>
                            <td className='border p-2 text-center'>L60</td>
                            <td className='border p-2 text-center'>V7</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimeTable;
