/**
 * Terms of Service Page
 * 
 * Legal terms and conditions for using ISA (Intelligent Standards Architect).
 */

import { Card } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: January 2, 2026
      </p>

      <Card className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="text-foreground leading-relaxed">
            By accessing or using the Intelligent Standards Architect (ISA) platform, you agree 
            to be bound by these Terms of Service and our Privacy Policy. If you do not agree 
            to these terms, you may not use ISA.
          </p>
          <p className="text-foreground leading-relaxed mt-4">
            ISA is operated by GS1 Netherlands and provides tools for navigating ESG regulations 
            and GS1 standards. These terms govern your use of the platform and all related services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
          <p className="text-foreground leading-relaxed">
            You must be at least 16 years old and have the legal capacity to enter into binding 
            contracts to use ISA. By using the platform, you represent and warrant that you meet 
            these requirements.
          </p>
          <p className="text-foreground leading-relaxed mt-4">
            If you are using ISA on behalf of an organization, you represent that you have the 
            authority to bind that organization to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
          <p className="text-foreground leading-relaxed mb-4">
            To access certain features of ISA, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your login credentials secure and confidential</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
          <p className="text-foreground leading-relaxed mt-4">
            We reserve the right to suspend or terminate accounts that violate these terms or 
            are inactive for extended periods.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
          <p className="text-foreground leading-relaxed mb-4">
            You agree to use ISA only for lawful purposes and in accordance with these terms. 
            You agree NOT to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>Violate any applicable laws, regulations, or third-party rights</li>
            <li>Use ISA to transmit harmful, offensive, or illegal content</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Interfere with or disrupt the platform's operation or servers</li>
            <li>Use automated tools (bots, scrapers) without our express permission</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Remove or modify any copyright, trademark, or proprietary notices</li>
            <li>Use ISA for competitive analysis or to build a competing product</li>
            <li>Misrepresent your affiliation with any person or organization</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          
          <h3 className="text-xl font-medium mb-3">5.1 Our Content</h3>
          <p className="text-foreground leading-relaxed mb-4">
            ISA and all its content, features, and functionality (including but not limited to 
            software, text, graphics, logos, and data compilations) are owned by GS1 Netherlands 
            or its licensors and are protected by copyright, trademark, and other intellectual 
            property laws.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            You are granted a limited, non-exclusive, non-transferable license to access and use 
            ISA for your internal business purposes. This license does not include the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>Reproduce, distribute, or publicly display ISA content</li>
            <li>Create derivative works based on ISA</li>
            <li>Sell, rent, lease, or sublicense access to ISA</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">5.2 Your Content</h3>
          <p className="text-foreground leading-relaxed">
            You retain ownership of any content you create or upload to ISA (such as analysis 
            reports, notes, or comments). By using ISA, you grant us a worldwide, non-exclusive, 
            royalty-free license to use, store, and process your content solely to provide and 
            improve our services.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">5.3 Third-Party Content</h3>
          <p className="text-foreground leading-relaxed">
            ISA aggregates information from public sources, including EU regulations, GS1 
            standards, and news articles. We do not claim ownership of this third-party content. 
            All trademarks, logos, and brand names are the property of their respective owners.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Service Availability</h2>
          <p className="text-foreground leading-relaxed mb-4">
            We strive to provide reliable access to ISA, but we do not guarantee uninterrupted 
            or error-free service. ISA is provided "as is" and "as available" without warranties 
            of any kind.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>Modify, suspend, or discontinue any aspect of ISA at any time</li>
            <li>Perform scheduled maintenance with reasonable notice</li>
            <li>Limit access to certain features or users</li>
            <li>Update these terms and our services without prior notice</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
          <p className="text-foreground leading-relaxed mb-4">
            <strong>IMPORTANT:</strong> ISA provides information and analysis tools to help you 
            understand ESG regulations and GS1 standards. However:
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-foreground leading-relaxed mb-3">
              <strong>ISA is not a substitute for professional legal, compliance, or business advice.</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>We do not guarantee the accuracy, completeness, or timeliness of any information</li>
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>Regulations and standards are subject to change without notice</li>
              <li>You should consult qualified professionals for specific compliance guidance</li>
            </ul>
          </div>
          <p className="text-foreground leading-relaxed mt-4">
            TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR 
            IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
            AND NON-INFRINGEMENT.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p className="text-foreground leading-relaxed mb-4">
            TO THE FULLEST EXTENT PERMITTED BY LAW, GS1 NETHERLANDS AND ITS AFFILIATES, 
            OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Damages resulting from your use or inability to use ISA</li>
            <li>Errors, omissions, or inaccuracies in ISA content</li>
            <li>Unauthorized access to your account or data</li>
            <li>Third-party actions or content</li>
          </ul>
          <p className="text-foreground leading-relaxed mt-4">
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM YOUR USE OF ISA SHALL NOT 
            EXCEED THE AMOUNT YOU PAID US (IF ANY) IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>
          <p className="text-foreground leading-relaxed mt-4">
            Some jurisdictions do not allow the exclusion of certain warranties or limitations 
            of liability. In such cases, our liability will be limited to the maximum extent 
            permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
          <p className="text-foreground leading-relaxed">
            You agree to indemnify, defend, and hold harmless GS1 Netherlands and its affiliates, 
            officers, employees, and agents from any claims, liabilities, damages, losses, and 
            expenses (including reasonable attorneys' fees) arising from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4 mt-4">
            <li>Your use or misuse of ISA</li>
            <li>Your violation of these terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your content or activities on ISA</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Data and Privacy</h2>
          <p className="text-foreground leading-relaxed">
            Your use of ISA is also governed by our Privacy Policy, which explains how we collect, 
            use, and protect your personal data. By using ISA, you consent to our data practices 
            as described in the Privacy Policy.
          </p>
          <p className="text-foreground leading-relaxed mt-4">
            We comply with the General Data Protection Regulation (GDPR) and other applicable 
            data protection laws. You have rights regarding your personal data, including the 
            right to access, correct, and delete your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
          <p className="text-foreground leading-relaxed mb-4">
            We may suspend or terminate your access to ISA at any time, with or without cause 
            or notice, if we believe you have violated these terms or engaged in unlawful or 
            harmful conduct.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            You may terminate your account at any time by contacting us at info@gs1.nl. Upon 
            termination:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>Your right to access ISA will immediately cease</li>
            <li>We will delete your account data within 90 days</li>
            <li>Provisions regarding intellectual property, disclaimers, and limitations of 
              liability will survive termination</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Disputes</h2>
          <p className="text-foreground leading-relaxed mb-4">
            These terms are governed by the laws of the Netherlands, without regard to conflict 
            of law principles. Any disputes arising from these terms or your use of ISA shall 
            be resolved exclusively in the courts of the Netherlands.
          </p>
          <p className="text-foreground leading-relaxed">
            Before initiating legal proceedings, you agree to first attempt to resolve disputes 
            informally by contacting us at info@gs1.nl.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
          <p className="text-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify you of 
            significant changes by email or through a prominent notice on ISA. Your continued 
            use of the platform after changes take effect constitutes acceptance of the revised 
            terms.
          </p>
          <p className="text-foreground leading-relaxed mt-4">
            If you do not agree to the modified terms, you must stop using ISA and may request 
            account deletion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">14. Severability</h2>
          <p className="text-foreground leading-relaxed">
            If any provision of these terms is found to be invalid or unenforceable, the 
            remaining provisions will continue in full force and effect. The invalid provision 
            will be modified to the minimum extent necessary to make it valid and enforceable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">15. Entire Agreement</h2>
          <p className="text-foreground leading-relaxed">
            These Terms of Service, together with our Privacy Policy, constitute the entire 
            agreement between you and GS1 Netherlands regarding your use of ISA, superseding 
            any prior agreements or understandings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
          <p className="text-foreground leading-relaxed mb-4">
            If you have questions about these terms, please contact us:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">GS1 Netherlands</p>
            <p className="text-muted-foreground">Email: info@gs1.nl</p>
            <p className="text-muted-foreground">Phone: +31 (0)33 450 11 00</p>
            <p className="text-muted-foreground">Address: Stationsplein 9K, 3818 LE Amersfoort, The Netherlands</p>
          </div>
        </section>

        <section className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            By using ISA, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms of Service.
          </p>
        </section>
      </Card>
    </div>
  );
}
