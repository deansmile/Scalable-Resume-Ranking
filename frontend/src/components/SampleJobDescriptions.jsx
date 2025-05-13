import React from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider,
  Icon
} from '@chakra-ui/react';
import { FiChevronDown, FiBriefcase, FiCode, FiDatabase, FiCloud, FiServer } from 'react-icons/fi';

// Sample job descriptions
const sampleJobDescriptions = {
  "Business Management": `Job Title: Business Analyst
  
Responsibilities:
- Analyze business requirements and processes to identify improvements
- Collaborate with stakeholders to understand needs and document requirements
- Develop and maintain project documentation and reports
- Facilitate meetings and workshops to gather information
- Create data-driven insights to support business decisions

Required Skills:
- Strong analytical and problem-solving abilities
- Excellent written and verbal communication skills
- Experience with requirements gathering and documentation
- Knowledge of business process modeling
- Proficiency in data analysis tools and visualization`,

  "Software Engineer": `Job Title: Full Stack Developer
  
Responsibilities:
- Develop responsive user interfaces using modern frontend frameworks
- Build scalable backend services and APIs
- Collaborate with cross-functional teams to deliver features
- Write clean, maintainable, and efficient code
- Participate in code reviews and implement best practices

Required Skills:
- Proficiency in JavaScript/TypeScript, HTML5, and CSS3
- Experience with React/Angular/Vue and Node.js
- Knowledge of database systems (SQL, NoSQL)
- Understanding of API design and integration
- Version control with Git and CI/CD workflows`,

  "Data Scientist": `Job Title: Data Scientist
  
Responsibilities:
- Analyze complex data sets to derive meaningful insights
- Build and deploy machine learning models
- Develop data visualizations and dashboards
- Collaborate with stakeholders to understand business needs
- Present findings and recommendations to technical and non-technical audiences

Required Skills:
- Proficiency in Python and data science libraries (Pandas, NumPy, Scikit-learn)
- Experience with machine learning frameworks (TensorFlow, PyTorch)
- Strong statistical analysis and data modeling skills
- Knowledge of data visualization tools (Tableau, PowerBI)
- Database querying and big data processing`,

  "Cloud Engineer": `Job Title: Cloud Engineer
  
Responsibilities:
- Design and implement scalable cloud infrastructure on AWS/Azure/GCP
- Automate deployment processes using infrastructure as code
- Containerize applications and manage orchestration
- Implement and maintain CI/CD pipelines
- Optimize cloud costs while ensuring high availability

Required Skills:
- Experience with cloud platforms (AWS, Azure, or GCP)
- Knowledge of infrastructure as code (Terraform, CloudFormation)
- Proficiency with containerization and orchestration (Docker, Kubernetes)
- Understanding of networking, security, and compliance in cloud environments
- Scripting and automation skills (Python, Bash)`,

  "DevOps Engineer": `Job Title: DevOps Engineer
  
Responsibilities:
- Build and maintain CI/CD pipelines for application deployment
- Automate infrastructure provisioning and management
- Monitor system performance and troubleshoot issues
- Implement security best practices and compliance requirements
- Collaborate with development teams to optimize delivery processes

Required Skills:
- Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- Knowledge of containerization and orchestration (Docker, Kubernetes)
- Infrastructure as code experience (Terraform, Ansible)
- Monitoring and logging tools expertise (Prometheus, ELK stack)
- Strong scripting and automation skills (Python, Bash)`
};

const SampleJobDescriptions = ({ setJobDescription }) => {
  const handleSelectSample = (sample) => {
    setJobDescription(sampleJobDescriptions[sample]);
  };

  const getIcon = (name) => {
    switch(name) {
      case 'Business Management':
        return FiBriefcase;
      case 'Software Engineer':
        return FiCode;
      case 'Data Scientist':
        return FiDatabase;
      case 'Cloud Engineer':
        return FiCloud;
      case 'DevOps Engineer':
        return FiServer;
      default:
        return FiBriefcase;
    }
  };

  return (
    <Box>
      <Menu>
        <MenuButton 
          as={Button} 
          rightIcon={<Icon as={FiChevronDown} />} 
          variant="outline" 
          size="sm"
          colorScheme="blue"
        >
          Sample Job Descriptions
        </MenuButton>
        <MenuList>
          {Object.keys(sampleJobDescriptions).map((job) => (
            <MenuItem key={job} onClick={() => handleSelectSample(job)}>
              <Icon as={getIcon(job)} mr={2} />
              {job}
            </MenuItem>
          ))}
          <MenuDivider />
          <MenuItem fontSize="xs" color="gray.500" isDisabled>
            Click to load a sample
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default SampleJobDescriptions; 