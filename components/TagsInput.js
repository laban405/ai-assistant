import React, { useEffect, useRef, useState } from "react";
// create css styles here
export default function TagsInput(props) {
  const [tags, setTags] = useState(props.tags || []);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { allTags } = props;
  const { form, field } = props;
  const { setFieldValue } = form;
  const { name } = field;
  //   const inputRef = useRef(null);
  useEffect(() => {
    setFieldValue(name, tags);
  }, [tags]);
  const handleChange = (e) => {
    const { value } = e.target;
    setInput(value);
    setShowSuggestions(true);
    handleSuggestion();
  };
  const handleKeyDown = (e) => {
    if (e.keyCode === 9 || e.keyCode === 13) {
      e.preventDefault();
    }
    const text = suggestions.length ? suggestions[0].text : input;
    if ([9, 13].includes(e.keyCode) && text) {
      // check if tag already exists in tags array
      if (tags.find((tag) => tag.toLowerCase() === text.toLowerCase())) {
        return;
      } else {
        setTags([...tags, text]);
        setInput("");
        setShowSuggestions(false);
      }
    }
  };
  const handleSuggestion = () => {
    const suggestFilterInput = allTags.filter((suggest) =>
      suggest.text.toLowerCase().includes(input.toLowerCase())
    );
    const suggestFilterTags = suggestFilterInput.filter(
      (suggest) => !tags.includes(suggest.text)
    );
    setSuggestions(suggestFilterTags);
  };
  const handleDelete = (i) => {
    const newTags = tags.filter((tag, j) => i !== j);
    setTags(newTags);
  };


  const clickOutsideRef = (content_ref, toggle_ref) => {
    document.addEventListener("mousedown", (e) => {
      // user click
      if (toggle_ref.current && toggle_ref.current.contains(e.target)) {
        content_ref.current.classList.add("active");
      } else {
        // user click outside toggle and content
        if (content_ref.current && !content_ref.current.contains(e.target)) {
          content_ref.current.classList.remove("active");
        }
      }
    });
  };

  const content_el = useRef(null);
  const toggle_el = useRef(null);
  clickOutsideRef(content_el, toggle_el);

  return (
    <div className="tags-content mb-1">
      <div className="tags-input" ref={toggle_el}>
        {tags.map((tag, i) => (
          <span key={tag} className="tag">
            {tag}
            <span className="remove-tag" onClick={() => handleDelete(i)}>
              x
            </span>
          </span>
        ))}
        <input
          type="text"
          className={`border-0 p-0 ${suggestions.length ? "suggestion" : ""}`}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleChange}
          placeholder="Add a tag"
        />
      </div>
      <div ref={content_el}>
        {suggestions.length > 0 && (
          <div className="tags-suggestions">
            {suggestions.map((suggest, index) => (
              <div
                className="suggestion-item"
                key={`suggest ${index}`}
                onClick={() => {
                  // check if tag already exists in tags array
                  if (!tags.includes(suggest.text)) {
                    setTags([...tags, suggest.text]);
                    // remove suggestion from suggestions array
                    const newSuggestions = suggestions.filter(
                      (s) => s.text !== suggest.text
                    );
                    setSuggestions(newSuggestions);
                  }
                  setInput("");
                }}
              >
                {suggest.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
