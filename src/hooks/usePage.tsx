//what do we want to achieve?
//we want the user to be able to:
//translate, explain, summarize any page
//translate, explain, summarize any paragraph
//translate, explain, summarize a chosen title (section)
//summarize any chapter

//what do we have to do?
//1-display buttons for each functionality
///1.1-display menu buttons (translate, explain, summarize) on the top right of each page
///1.2-display menu buttons when clicking besides any paragraph
///1.3-display menu buttons next to each title
///1.4-display menu buttons next to chapter title

//2-get action:
///2.1-if action concerns page:
////2.1.1-get visible text
////2.1.2-get full page text
////2.1.3-translate, explain, or summarize the text

///2.2-if action concerns paragraph
////2.2.1-get paragraph text
////2.2.2-translate, explain, or summarize the text

///2.3-if action concerns section (title)
////2.3.1-get visible text (title)
////2.3.2-get full section text
/////2.3.2.1-get all text starting from the title until reaching the next title
////2.3.3--translate, explain, or summarize the text

///2.4-if action concerns chapter:
////2.4.1-get all text from chapter start to end
////2.4.2-summarize the text

const usePage = () => {
  return {};
};

export default usePage;
