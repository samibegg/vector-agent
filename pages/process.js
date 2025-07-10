import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const processPhases = [
  {
    title: '1. Discovery & Assessment',
    description:
      'We begin every engagement by thoroughly understanding your current systems, business objectives, and transformation goals.',
    story: `One of our clients, a global logistics company, was struggling with legacy infrastructure slowing down their analytics capabilities. Our consultants performed a deep-dive assessment across three continents, identifying bottlenecks and crafting a modernization roadmap. During workshops with operations leaders, we surfaced untapped data silos and scoped out real-time tracking opportunities. The resulting blueprint aligned their IT and business units and unlocked executive sponsorship for a major digital overhaul.`,
  },
  {
    title: '2. Strategic Planning',
    description:
      'Based on insights from the discovery phase, we craft a strategic plan tailored to your needs, constraints, and growth targets.',
    story: `For a leading healthcare provider, we mapped out a phased AI strategy to automate claims processing while ensuring HIPAA compliance. During stakeholder sessions, we aligned data privacy concerns with a secure MLOps framework, and built an ROI model projecting $10M in annual savings. The strategic roadmap became the centerpiece of their executive board presentation, helping secure funding and C-suite buy-in for a multi-year transformation.`,
  },
  {
    title: '3. Solution Architecture & Design',
    description:
      'We translate strategy into architecture — selecting the right tools, platforms, and blueprints to enable scalable, secure solutions.',
    story: `A fintech startup approached us to re-platform their monolith to microservices while launching globally. Our architects co-designed a Kubernetes-based cloud-native architecture integrated with Kafka and Redis for high availability. In collaborative whiteboarding sessions, we iteratively mapped domain boundaries and inter-service dependencies. Within 6 weeks, we delivered a reference architecture that was cloud-agnostic, compliant, and ready to scale to millions of users.`,
  },
  {
    title: '4. Implementation & Engineering',
    description:
      'We lead or embed with your teams to implement solutions with engineering best practices, automation, and high quality.',
    story: `In a retail modernization effort, we embedded two senior engineers to help containerize legacy .NET apps and implement CI/CD with GitHub Actions and Helm. As we migrated workloads to Azure Kubernetes Service (AKS), we coached internal teams on infrastructure-as-code using Terraform. Within four months, the client was independently managing releases, reducing production incidents by 70%, and deploying features 3x faster.`,
  },
  {
    title: '5. Optimization & Growth',
    description:
      'Post-launch, we continue to optimize, monitor, and evolve solutions to meet growing demands and drive continuous value.',
    story: `An ed-tech platform saw rapid growth during a global expansion push. After deploying a scalable data lake architecture with Delta Lake and Spark, we set up a cost-observability framework using Datadog and AWS CloudWatch. Our fine-tuning led to a 45% reduction in compute costs and helped uncover latent revenue opportunities via cohort analytics. We stayed on for quarterly reviews and roadmap evolution as their strategic partner.`,
  },
];

export default function OurProcessPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="bg-white min-h-screen px-6 py-16 max-w-5xl mx-auto flex-1">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-12">
          Our Process
        </h1>
        {processPhases.map((phase, idx) => (
          <div key={idx} className="mb-10">
            <div className="p-6 bg-gray-100 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800">{phase.title}</h2>
              <p className="mt-2 text-gray-600">{phase.description}</p>
              <button
                onClick={() => toggleExpand(idx)}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                {expandedIndex === idx ? 'Hide Success Story ▲' : 'Read Success Story ▼'}
              </button>
              {expandedIndex === idx && (
                <div className="mt-4 p-4 bg-white rounded-lg border text-gray-700 leading-relaxed">
                  {phase.story}
                </div>
              )}
            </div>
          </div>
        ))}

        <section className="text-center max-w-3xl mx-auto mt-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Let's discuss how our expertise in cloud, data, AI, and application development can accelerate your digital journey and drive meaningful growth.
          </p>
          <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md text-lg transition inline-block">
            Get In Touch
          </Link>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
