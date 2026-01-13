import FeedbackForm from '@/components/FeedbackForm';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: '用户反馈 - 番茄AI写作助手',
  description: '提交您的反馈、建议或问题，帮助我们更好地为您服务',
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FeedbackForm />
      </div>
    </div>
  );
}
