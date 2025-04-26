import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const truncateString = (string: string, slice?: number) => {
  return string.slice(0, slice || 30) + '...'
}

export const getRelationshipBadgeColor = (relationshipCode: string) => {
  switch (relationshipCode) {
    case 'SELF_OWNED_SELF_TAUGHT':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'SELF_OWNED_OTHER_TAUGHT':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'OTHER_OWNED_SELF_TAUGHT':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'OTHER_OWNED_OTHER_TAUGHT':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'SELF_OWNED_FOR_OTHER_SELF_TAUGHT':
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'SELF_OWNED_FOR_OTHER_OTHER_TAUGHT':
      return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

// Helper function to get a short display name for relationship
export const getRelationshipShortName = (relationshipCode: string, userDeptRole = '') => {
  const isOwner = userDeptRole === 'owner';
  const isTeacher = userDeptRole === 'teacher';
  const isLearner = userDeptRole === 'learner';
  
  switch (relationshipCode) {
    case 'SELF_OWNED_SELF_TAUGHT':
      return isOwner ? 'We Own & Teach' : 'Dept Owns & Teaches';
    case 'SELF_OWNED_OTHER_TAUGHT':
      return isOwner ? 'We Own, Others Teach' : 'Dept Owns, Others Teach';
    case 'OTHER_OWNED_SELF_TAUGHT':
      return isTeacher ? 'We Teach for Others' : 'Teaching for Others';
    case 'OTHER_OWNED_OTHER_TAUGHT':
      return isLearner ? 'External Course' : 'External Course';
    case 'SELF_OWNED_FOR_OTHER_SELF_TAUGHT':
      return isOwner ? 'We Provide & Teach' : 'Dept Provides & Teaches';
    case 'SELF_OWNED_FOR_OTHER_OTHER_TAUGHT':
      return isOwner ? 'We Provide, Others Teach' : 'Dept Provides, Others Teach';
    default:
      return 'Unknown';
  }
}; 


export const getRelationshipDisplayName = (relationshipCode: string, userRoles: string[]) => {
  const isOwner = userRoles.includes('owner');
  const isTeacher = userRoles.includes('teacher');
  const isLearner = userRoles.includes('learner');

  switch (relationshipCode) {
    case 'SELF_OWNED_SELF_TAUGHT':
      return isOwner ? 'We Own & Teach' : 'Owned & Taught by This Dept';
    case 'SELF_OWNED_OTHER_TAUGHT':
      return isOwner ? 'We Own, Others Teach' : 'Owned by This Dept, Taught by Others';
    case 'OTHER_OWNED_SELF_TAUGHT':
      return isTeacher ? 'We Teach for Others' : 'Taught by This Dept';
    case 'OTHER_OWNED_OTHER_TAUGHT':
      return isLearner ? 'External Course' : 'Owned & Taught Externally';
    case 'SELF_OWNED_FOR_OTHER_SELF_TAUGHT':
      return isOwner ? 'We Provide & Teach' : 'Provided & Taught by This Dept';
    case 'SELF_OWNED_FOR_OTHER_OTHER_TAUGHT':
      return isOwner ? 'We Provide, Others Teach' : 'Provided by This Dept, Taught by Others';
    default:
      return 'Unknown Relationship';
  }
};