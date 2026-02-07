import { Shield, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          ← Back to Home
        </Button>
        
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          
          <div className="text-sm text-gray-600">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Your Privacy Matters
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy explains how our clinical trial matching tool handles information. 
              We are committed to protecting your privacy and being transparent about our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Data We Collect</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <p className="text-green-900 font-semibold mb-2">
                We do NOT collect, store, or transmit personal health information.
              </p>
              <p className="text-green-800 text-sm">
                All trial matching happens locally in your web browser. No medical information 
                you enter is sent to our servers, stored in databases, or shared with third parties.
              </p>
            </div>
            
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <strong>Information You Enter:</strong> Any medical information you provide 
                  (cancer type, stage, biomarkers, treatment history) is processed entirely in 
                  your browser and never transmitted to our servers.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <strong>Session Data:</strong> Your session data is temporary and exists only 
                  while you use the tool. It is automatically cleared when you close your browser 
                  or navigate away.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <strong>No User Accounts:</strong> We do not require account creation, login, 
                  or registration. We do not store user profiles or histories.
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How the Tool Works</h2>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              <li><strong>You enter information</strong> about your cancer diagnosis and treatment history in your web browser.</li>
              <li><strong>Your browser processes</strong> this information locally using matching algorithms that run in your browser (not on our servers).</li>
              <li><strong>Results are displayed</strong> based on trial data sourced from ClinicalTrials.gov (a public U.S. government database).</li>
              <li><strong>Nothing is saved.</strong> When you close the page, all data is cleared from your browser.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">We may use the following third-party services to operate this tool:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div><strong>Hosting Provider:</strong> Our website is hosted by a third-party service. They do not receive or have access to your medical information.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div><strong>ClinicalTrials.gov:</strong> Trial information is sourced from the U.S. government's clinical trial registry. We do not send your personal information to them.</div>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">
              Note: We do not use tracking cookies, advertising networks, or analytics that collect 
              medical information. Basic site usage statistics (page views, browser type) may be 
              collected in aggregate form without any medical details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>Right to Privacy:</strong> You have complete control over your information. Since we don't store any data, there's nothing for us to share, sell, or misuse.</p>
              <p><strong>Right to Access:</strong> Because we don't collect or store your data, there is no data for you to access or request.</p>
              <p><strong>Right to Deletion:</strong> Your data is automatically cleared from your browser when you close the page. No deletion request is necessary.</p>
              <p><strong>Right to Opt-Out:</strong> You can stop using the tool at any time simply by closing your browser window.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">HIPAA Compliance</h2>
            <p className="text-gray-700 mb-4">This tool is not subject to HIPAA because:</p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span>We are not a healthcare provider, health plan, or healthcare clearinghouse</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span>We do not collect, store, or transmit protected health information (PHI)</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span>We provide informational services only, not medical treatment or advice</span></li>
            </ul>
            <p className="text-gray-700">However, we still treat your privacy with the utmost respect and follow privacy best practices.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              Security Measures
            </h2>
            <p className="text-gray-700 mb-4">Even though we don't store your data, we take security seriously:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span><strong>HTTPS Encryption:</strong> All connections to our site use secure HTTPS encryption</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span><strong>Client-Side Processing:</strong> All matching logic runs in your browser, not on our servers</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span><strong>No Persistent Storage:</strong> We don't use cookies or local storage to save medical information</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span><span><strong>Regular Updates:</strong> We keep our software up-to-date with security patches</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              This tool is intended for adult use and for parents/guardians of minor patients. 
              We do not knowingly collect information from children under 13. If you are under 18, 
              please use this tool with parental or guardian supervision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Any changes will be posted on 
              this page with an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">If you have questions about this Privacy Policy, please contact us:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> privacy@oncologyscout.com</p>
            </div>
          </section>

          <section className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Privacy Policy Summary</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2"><span className="font-bold">✓</span><span>We don't collect or store your medical information</span></li>
              <li className="flex items-start gap-2"><span className="font-bold">✓</span><span>All processing happens in your browser</span></li>
              <li className="flex items-start gap-2"><span className="font-bold">✓</span><span>Data is automatically cleared when you close the page</span></li>
              <li className="flex items-start gap-2"><span className="font-bold">✓</span><span>We use HTTPS encryption for all connections</span></li>
              <li className="flex items-start gap-2"><span className="font-bold">✓</span><span>We don't share data with third parties</span></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
