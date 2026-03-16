export type Language = 'en' | 'bn';

export const translations = {
  en: {
    // Header
    appTitle: 'Taka Ache?',
    appSubtitle: 'Find nearby ATMs and current status',
    
    // Search
    searchPlaceholder: 'Search location...',
    searchButton: 'Search',
    searching: 'Searching...',
    myLocationButton: 'My Location',
    searchExample: 'Try: "Dhaka" or coordinates like "23.8103, 90.4125"',
    
    // Map
    loadingATMs: 'Loading ATM locations...',
    atmCount: (count: number) => `${count} ATM${count !== 1 ? 's' : ''} found`,
    
    // Sidebar
    atmDetails: 'ATM Details',
    operator: 'Operator',
    name: 'Name',
    address: 'Address',
    coordinates: 'Coordinates',
    navigateButton: 'Navigate with Google Maps',
    reviewsTitle: 'Reviews & Status',
    writeReview: 'Write Review',
    cancel: 'Cancel',
    
    // Review Stats
    reviews: 'Reviews',
    cash: 'Cash',
    working: 'Working',
    
    // Review Form
    warningTitle: 'Please Provide Accurate Information',
    warningMessage: 'This is a helpful website to assist others in finding working ATMs. Please do not provide false or misleading information. Your honest review helps the community!',
    yourName: 'Your Name',
    namePlaceholder: 'Enter your name',
    workingStatus: 'Working Status',
    statusWorking: '✅ Working',
    statusPartial: '⚠️ Partially Working',
    statusNotWorking: '❌ Not Working',
    cashAvailable: 'Cash Available',
    comment: 'Comment',
    commentPlaceholder: 'Share your experience...',
    postReview: 'Post Review',
    posting: 'Posting...',
    
    // Review List
    noReviews: 'No reviews yet. Be the first to review!',
    
    // Loading
    loadingMessage: 'Loading ATM locations...',
    requestingLocation: 'Requesting location permission',
    
    // Errors
    locationDenied: 'Location permission denied. Using default location (Dhaka, Bangladesh).',
    locationUnavailable: 'Location unavailable. Using default location (Dhaka, Bangladesh).',
    locationTimeout: 'Location request timeout. Using default location (Dhaka, Bangladesh).',
    atmLoadError: 'Failed to load ATM locations. Please try again.',
    reviewPostError: 'Failed to post review. Please try again.',
    retryLocation: 'Retry Location Request',
    
    // API Key Info
    apiKeyTitle: 'Get More ATM Coverage!',
    apiKeyMessage: 'Add a free Google Places API key to see 5-10x more ATMs.',
    setupGuide: 'Setup Guide',
    
    // Data Source
    poweredBy: 'Powered by',
  },
  bn: {
    // Header
    appTitle: 'টাকা আছে?',
    appSubtitle: 'কাছাকাছি এটিএম খুঁজুন এবং বর্তমান অবস্থা দেখুন',
    
    // Search
    searchPlaceholder: 'অবস্থান খুঁজুন...',
    searchButton: 'খুঁজুন',
    searching: 'খুঁজছি...',
    myLocationButton: 'আমার অবস্থান',
    searchExample: 'চেষ্টা করুন: "ঢাকা" অথবা স্থানাঙ্ক যেমন "23.8103, 90.4125"',
    
    // Map
    loadingATMs: 'এটিএম অবস্থান লোড হচ্ছে...',
    atmCount: (count: number) => `${count}টি এটিএম পাওয়া গেছে`,
    
    // Sidebar
    atmDetails: 'এটিএম বিস্তারিত',
    operator: 'পরিচালক',
    name: 'নাম',
    address: 'ঠিকানা',
    coordinates: 'স্থানাঙ্ক',
    navigateButton: 'গুগল ম্যাপে নেভিগেট করুন',
    reviewsTitle: 'রিভিউ এবং অবস্থা',
    writeReview: 'রিভিউ লিখুন',
    cancel: 'বাতিল',
    
    // Review Stats
    reviews: 'রিভিউ',
    cash: 'টাকা',
    working: 'কার্যকর',
    
    // Review Form
    warningTitle: 'সঠিক তথ্য প্রদান করুন',
    warningMessage: 'এটি একটি সহায়ক ওয়েবসাইট যা অন্যদের কার্যকর এটিএম খুঁজে পেতে সাহায্য করে। মিথ্যা বা বিভ্রান্তিকর তথ্য প্রদান করবেন না। আপনার সৎ রিভিউ সম্প্রদায়কে সাহায্য করে!',
    yourName: 'আপনার নাম',
    namePlaceholder: 'আপনার নাম লিখুন',
    workingStatus: 'কার্যকর অবস্থা',
    statusWorking: '✅ কার্যকর',
    statusPartial: '⚠️ আংশিক কার্যকর',
    statusNotWorking: '❌ কার্যকর নয়',
    cashAvailable: 'টাকা আছে',
    comment: 'মন্তব্য',
    commentPlaceholder: 'আপনার অভিজ্ঞতা শেয়ার করুন...',
    postReview: 'রিভিউ পোস্ট করুন',
    posting: 'পোস্ট হচ্ছে...',
    
    // Review List
    noReviews: 'এখনও কোন রিভিউ নেই। প্রথম রিভিউ করুন!',
    
    // Loading
    loadingMessage: 'এটিএম অবস্থান লোড হচ্ছে...',
    requestingLocation: 'অবস্থান অনুমতি অনুরোধ করা হচ্ছে',
    
    // Errors
    locationDenied: 'অবস্থান অনুমতি প্রত্যাখ্যান করা হয়েছে। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে (ঢাকা, বাংলাদেশ)।',
    locationUnavailable: 'অবস্থান পাওয়া যাচ্ছে না। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে (ঢাকা, বাংলাদেশ)।',
    locationTimeout: 'অবস্থান অনুরোধ টাইমআউট। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে (ঢাকা, বাংলাদেশ)।',
    atmLoadError: 'এটিএম অবস্থান লোড করতে ব্যর্থ। আবার চেষ্টা করুন।',
    reviewPostError: 'রিভিউ পোস্ট করতে ব্যর্থ। আবার চেষ্টা করুন।',
    retryLocation: 'অবস্থান অনুরোধ পুনরায় চেষ্টা করুন',
    
    // API Key Info
    apiKeyTitle: 'আরও এটিএম কভারেজ পান!',
    apiKeyMessage: 'একটি বিনামূল্যে গুগল প্লেসেস API কী যোগ করুন এবং ৫-১০ গুণ বেশি এটিএম দেখুন।',
    setupGuide: 'সেটআপ গাইড',
    
    // Data Source
    poweredBy: 'পরিচালিত',
  },
};

export function getTranslation(lang: Language) {
  return translations[lang];
}
