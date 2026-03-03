import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const AddTask = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title,
        priority,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 hover:border-primary-300 hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add New Task</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />
        
        <div className="flex gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-300"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-300"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim()}
          >
            Add Task
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;