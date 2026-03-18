import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Trophy, Target, Calendar, Check, ArrowRight, Sparkles, Dumbbell, Brain, Heart, GraduationCap, FastForward } from 'lucide-react';
import { message } from 'antd';
import BottomNav from '../../../components/BottomNav';
import routineApi from '../../../api/routineApi';
import categoryApi from '../../../api/categoryApi';

export default function CreateRoutinePage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dbCategories, setDbCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        categoryId: '',
        frequency: 'Daily',
        type: 'Checkbox',
        targetValue: 1,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoryLoading(true);
                const res = await categoryApi.getAll();
                const data = res.data?.data || res.data;
                if (data && data.length > 0) {
                    setDbCategories(data);
                } else {
                    setDbCategories([
                        { id: '1', name: 'Fitness' },
                        { id: '2', name: 'Mindset' },
                        { id: '3', name: 'Health' },
                        { id: '4', name: 'Learning' }
                    ]);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setDbCategories([
                    { id: '1', name: 'Fitness' },
                    { id: '2', name: 'Mindset' },
                    { id: '3', name: 'Health' },
                    { id: '4', name: 'Learning' }
                ]);
            } finally {
                setCategoryLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const staticCategories = [
        { id: 'fitness', name: 'Fitness', icon: <Dumbbell size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        { id: 'mind', name: 'Mindset', icon: <Brain size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
        { id: 'health', name: 'Health', icon: <Heart size={24} />, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
        { id: 'learning', name: 'Learning', icon: <GraduationCap size={24} />, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    ];

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // Find category ID
            let finalCategoryId = form.categoryId;
            if (!finalCategoryId && dbCategories.length > 0) {
                const match = dbCategories.find(c => 
                    c.name.toLowerCase().includes(form.category.toLowerCase()) || 
                    form.category.toLowerCase().includes(c.name.toLowerCase())
                );
                finalCategoryId = match ? match.id : dbCategories[0].id;
            }

            // 1. Create Routine
            // Note: visibility: 1 (Private) as Integer to match .NET Enum requirements
            const routinePayload = {
                name: form.name,
                description: form.description || "Routine created by user",
                schedule: {
                    type: form.frequency,
                    daysOfWeek: [] 
                },
                remindAt: "08:00:00", 
                visibility: 1, 
                categoryId: finalCategoryId || undefined
            };

            console.log('Sending Real Payload:', routinePayload);

            const routineRes = await routineApi.create(routinePayload);
            const routine = routineRes.data?.data || routineRes.data;

            if (!routine?.id) {
                throw new Error("Server response missing routine ID");
            }

            // 2. Add Task to Routine
            const taskPayload = {
                name: form.name,
                type: form.type === 'Number' ? 'Quantity' : 'Checkbox',
                targetValue: parseInt(form.targetValue) || 1,
                unit: form.type === 'Number' ? 'Units' : 'Boolean',
                order: 1
            };

            await routineApi.addTask(routine.id, taskPayload);

            message.success('Tạo routine thành công! ✨');
            navigate('/customer/selfroutin');
        } catch (err) {
            console.error('SERVER REJECTION:', err.response?.data || err);
            const errorData = err.response?.data;
            let errorMsg = 'Không thể lưu routine';
            
            if (errorData?.errors) {
                // Formatting server validation errors
                errorMsg = Object.entries(errorData.errors)
                    .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                    .join(' | ');
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            }

            message.error(`Lỗi hệ thống: ${errorMsg}`, 15);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-32">
            {/* Minimal Header */}
            <header className="p-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-30">
                <button 
                    onClick={step === 1 ? () => navigate(-1) : prevStep} 
                    className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-all active:scale-90"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-lime-400' : 'bg-neutral-800'}`} />
                    ))}
                </div>
                <div className="w-10"></div>
            </header>

            <main className="px-6 md:max-w-md md:mx-auto">
                
                {/* Step 1: Category */}
                {step === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest px-1">Phase 01</span>
                            <h1 className="text-4xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">Choose Your<br/>Focus Zone</h1>
                            <p className="text-sm text-neutral-500 font-medium">What part of your life are we leveling up today?</p>
                        </div>

                        {categoryLoading && dbCategories.length === 0 ? (
                             <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-400"></div>
                             </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {staticCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            const dbCat = dbCategories.find(c => 
                                                c.name.toLowerCase().includes(cat.name.toLowerCase()) || 
                                                cat.name.toLowerCase().includes(c.name.toLowerCase())
                                            );
                                            setForm({
                                                ...form, 
                                                category: cat.name,
                                                categoryId: dbCat ? dbCat.id : (dbCategories[0]?.id || '')
                                            });
                                            nextStep();
                                        }}
                                        className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col gap-4 text-left active:scale-95 group ${form.category === cat.name ? 'border-lime-400 bg-lime-400/5' : 'border-neutral-800 bg-neutral-900/50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase tracking-tighter">{cat.name}</h3>
                                            <span className="text-[10px] text-neutral-500 font-bold uppercase">Level Up</span>
                                        </div>
                                        <ArrowRight size={16} className="absolute bottom-6 right-6 text-neutral-700 group-hover:text-lime-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest px-1">Phase 02</span>
                            <h1 className="text-4xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">Define The<br/>Mission</h1>
                            <p className="text-sm text-neutral-500 font-medium">Give your routine a powerful name and description.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Mission Title</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="e.g. Extreme Morning Cardio"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-lime-400/50 transition-all font-bold placeholder:text-neutral-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Motivation / Description</label>
                                <textarea 
                                    placeholder="Why are you doing this? (Keep it short)"
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-lime-400/50 transition-all placeholder:text-neutral-800 h-32 resize-none leading-relaxed"
                                />
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={!form.name}
                                className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-95 shadow-xl uppercase tracking-widest text-sm"
                            >
                                Next Setup
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Target */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest px-1">Phase 03</span>
                            <h1 className="text-4xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">Target &<br/>Frequency</h1>
                            <p className="text-sm text-neutral-500 font-medium">How often and how much will you track?</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Repeat</label>
                                    <div className="relative">
                                        <select 
                                            value={form.frequency}
                                            onChange={e => setForm({...form, frequency: e.target.value})}
                                            className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-lime-400/50 transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                        </select>
                                        <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Tracking</label>
                                    <div className="relative">
                                        <select 
                                            value={form.type}
                                            onChange={e => setForm({...form, type: e.target.value})}
                                            className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-lime-400/50 transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="Checkbox">Done / Undone</option>
                                            <option value="Number">Numeric Value</option>
                                        </select>
                                        <Target size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {form.type === 'Number' && (
                                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Daily Target Goal</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={form.targetValue}
                                        onChange={e => setForm({...form, targetValue: e.target.value})}
                                        className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-lime-400/50 transition-all font-bold"
                                    />
                                </div>
                            )}

                            <div className="p-5 bg-lime-400/5 rounded-3xl border border-lime-400/20 flex gap-4">
                                <Sparkles className="text-lime-400 shrink-0" size={24} />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-white uppercase italic">Pro Habit Tip</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                                        Starting small with a <span className="text-lime-400">Daily Checkbox</span> is proven to build stronger streaks in the first 21 days.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !form.name}
                                className="w-full bg-lime-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 group shadow-2xl shadow-lime-400/20 active:scale-95 transition-all uppercase tracking-widest text-sm"
                            >
                                {loading ? 'DEPLOYING PLAN...' : 'ACTIVATE ROUTINE'}
                                {!loading && <Sparkles size={18} className="animate-pulse" />}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Success Overlay when loading */}
            {loading && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-500">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-lime-400 blur-3xl opacity-20 animate-pulse"></div>
                        <div className="w-24 h-24 rounded-full border-4 border-lime-400 border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lime-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Syncing Your<br/>New Habit</h2>
                    <p className="text-sm text-neutral-500 font-medium">Prepare yourself for the journey ahead.</p>
                </div>
            )}

            <BottomNav activeItem="target" />
        </div>
    );
}
