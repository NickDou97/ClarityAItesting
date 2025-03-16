// Netlify Scheduled Function for Follow-up Emails
// This function runs on a schedule to send follow-up emails to users
// who have submitted forms but haven't converted

const { getNetlifyBlob } = require('@netlify/blobs');
const { schedule } = require('@netlify/functions');

// Email service integration (example with a generic email service)
// In production, replace with your preferred email provider
const sendEmail = async (recipient, templateId, data) => {
  // This is a placeholder for actual email sending logic
  // In production, integrate with services like SendGrid, Mailgun, etc.
  console.log(`[EMAIL] Sending template ${templateId} to ${recipient}`);
  console.log(`[EMAIL] Data:`, JSON.stringify(data));
  
  // Return success for demonstration
  return { success: true, messageId: `demo-${Date.now()}` };
};

// Function to process follow-ups for assessment submissions
const processAssessmentFollowUps = async (context) => {
  try {
    // Get blob store for assessment submissions
    const assessmentBlob = getNetlifyBlob({
      namespace: 'user-data',
      context,
    });
    
    // List all blobs with assessment data
    // In production, you would use a more sophisticated query mechanism
    const assessmentKeys = await assessmentBlob.list();
    
    // Track the submissions we've processed
    const processed = [];
    
    // Process each assessment submission
    for (const key of assessmentKeys.blobs) {
      if (key.startsWith('form-assessment-results-')) {
        // Get the submission data
        const submissionData = JSON.parse(await assessmentBlob.get(key));
        
        // Calculate days since submission
        const submissionDate = new Date(submissionData.timestamp);
        const daysSinceSubmission = Math.floor((new Date() - submissionDate) / (1000 * 60 * 60 * 24));
        
        // Send appropriate follow-up based on time elapsed
        if (daysSinceSubmission === 3 && !submissionData.followup3) {
          // 3-day follow-up: Check if they've seen their results
          await sendEmail(submissionData.email, 'assessment-results-reminder', {
            name: submissionData.name || 'there',
            assessmentType: 'AI Maturity',
            resultsUrl: `https://clarityai.com/assessment-results?id=${key}`,
          });
          
          // Mark as processed
          submissionData.followup3 = true;
          await assessmentBlob.set(key, JSON.stringify(submissionData));
          processed.push({ key, type: '3-day', email: submissionData.email });
        } 
        else if (daysSinceSubmission === 7 && !submissionData.followup7) {
          // 7-day follow-up: Additional resources
          await sendEmail(submissionData.email, 'assessment-resources', {
            name: submissionData.name || 'there',
            assessmentType: 'AI Maturity',
            resources: [
              { title: 'AI Implementation Guide', url: 'https://clarityai.com/guides/ai-implementation' },
              { title: 'CX Team Transformation Playbook', url: 'https://clarityai.com/playbooks/cx-transformation' },
            ],
          });
          
          // Mark as processed
          submissionData.followup7 = true;
          await assessmentBlob.set(key, JSON.stringify(submissionData));
          processed.push({ key, type: '7-day', email: submissionData.email });
        }
        else if (daysSinceSubmission === 14 && !submissionData.followup14) {
          // 14-day follow-up: Consultation offer
          await sendEmail(submissionData.email, 'assessment-consultation', {
            name: submissionData.name || 'there',
            assessmentType: 'AI Maturity',
            consultationUrl: 'https://clarityai.com/consultation',
          });
          
          // Mark as processed
          submissionData.followup14 = true;
          await assessmentBlob.set(key, JSON.stringify(submissionData));
          processed.push({ key, type: '14-day', email: submissionData.email });
        }
      }
    }
    
    return {
      processedCount: processed.length,
      processed,
    };
  } catch (error) {
    console.error('Error processing assessment follow-ups:', error);
    return { error: error.message };
  }
};

// Function to process newsletter subscriber follow-ups
const processNewsletterFollowUps = async (context) => {
  try {
    // Get blob store for newsletter submissions
    const newsletterBlob = getNetlifyBlob({
      namespace: 'user-data',
      context,
    });
    
    // List all blobs with newsletter data
    const newsletterKeys = await newsletterBlob.list();
    
    // Track the submissions we've processed
    const processed = [];
    
    // Process each newsletter submission
    for (const key of newsletterKeys.blobs) {
      if (key.startsWith('form-newsletter-signup-')) {
        // Get the submission data
        const submissionData = JSON.parse(await newsletterBlob.get(key));
        
        // Calculate days since submission
        const submissionDate = new Date(submissionData.timestamp);
        const daysSinceSubmission = Math.floor((new Date() - submissionDate) / (1000 * 60 * 60 * 24));
        
        // Send appropriate follow-up based on time elapsed
        if (daysSinceSubmission === 1 && !submissionData.welcomeSent) {
          // Welcome email with immediate value
          await sendEmail(submissionData.email, 'newsletter-welcome', {
            email: submissionData.email,
            firstResourceUrl: 'https://clarityai.com/resources/getting-started',
          });
          
          // Mark as processed
          submissionData.welcomeSent = true;
          await newsletterBlob.set(key, JSON.stringify(submissionData));
          processed.push({ key, type: 'welcome', email: submissionData.email });
        }
      }
    }
    
    return {
      processedCount: processed.length,
      processed,
    };
  } catch (error) {
    console.error('Error processing newsletter follow-ups:', error);
    return { error: error.message };
  }
};

// Main handler for the scheduled function
// This runs according to the schedule in netlify.toml
const handler = async (event, context) => {
  console.log('Running scheduled follow-up emails function');
  
  try {
    // Process different types of follow-ups
    const assessmentResults = await processAssessmentFollowUps(context);
    const newsletterResults = await processNewsletterFollowUps(context);
    
    // Combine results
    const results = {
      timestamp: new Date().toISOString(),
      assessmentFollowUps: assessmentResults,
      newsletterFollowUps: newsletterResults,
      totalEmailsSent: (assessmentResults.processedCount || 0) + (newsletterResults.processedCount || 0),
    };
    
    // Log results
    console.log('Follow-up processing complete:', JSON.stringify(results));
    
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (error) {
    console.error('Error in scheduled function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process follow-ups', details: error.message }),
    };
  }
};

// Export the scheduled handler (runs daily at 8am UTC)
exports.handler = schedule('0 8 * * *', handler); 