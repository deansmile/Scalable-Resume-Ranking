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
import { FiChevronDown, FiBriefcase, FiCode, FiDatabase } from 'react-icons/fi';

// Sample job descriptions
const sampleJobDescriptions = {
  "Business Management": `Job Title: Business Analyst
  
Responsibilities:
- Analyze business requirements and processes to identify improvements
- Collaborate with stakeholders to understand needs and document requirements
- Develop and maintain project documentation and reports
- Facilitate meetings and workshops to gather information
- Support system testing and implementation

Required Skills:
- Strong analytical and problem-solving abilities
- Excellent written and verbal communication skills
- Experience with requirements gathering and documentation
- Knowledge of business process modeling
- Proficiency in Microsoft Office suite, especially Excel`,

  "Software Engineer": `Job Title: Frontend Developer
  
Responsibilities:
- Develop responsive user interfaces using React.js
- Collaborate with backend developers to integrate APIs
- Implement UI/UX designs with a focus on usability
- Write clean, maintainable, and efficient code
- Participate in code reviews and testing

Required Skills:
- Strong proficiency in JavaScript, HTML5, and CSS3
- Experience with React.js and related libraries
- Knowledge of modern frontend build pipelines
- Familiarity with RESTful APIs and state management
- Understanding of cross-browser compatibility`,

  "Data Scientist": `Job Title: Data Scientist
  
Responsibilities:
- Analyze complex data sets to derive meaningful insights
- Build and deploy machine learning models
- Develop data visualizations and dashboards
- Collaborate with stakeholders to understand business needs
- Present findings and recommendations

Required Skills:
- Proficiency in Python and data science libraries (Pandas, NumPy)
- Experience with machine learning frameworks
- Strong statistical analysis skills
- Knowledge of data visualization tools
- Excellent problem-solving abilities`
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