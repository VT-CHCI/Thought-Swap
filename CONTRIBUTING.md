# How to Contribute to ThoughtSwap

Thank you for your interest in ThoughtSwap! We welcome any help to make the
core project better. As a contributor, following these guidelines will greatly
increase the likelihood of your contributions making it into the project:

* [Issues guidelines](#issues)
* [Code Guidelines](#code)
* [Submission Guidelines](#submission)

## <a name="issues"></a> Submitting Issues

If you would like to submit an issue, please submit it to the 
[core repository](https://github.com/VT-CHCI/Thought-Swap).

But before you submit an issue, please search the existing issues to see if what
you want to submit already exists, or has already been discussed.

### Bugs

Before attempting to fix a bug, we need to reproduce and confirm it. To 
facilitate this, please provide the following information in bug issues:

* The url of page the bug occurred on
* Your browser and its version
* Your operating system
* As accurate as possible description of the bug (can include screenshots)

### Features

Feel free to <i>request</i> a new feature by simply submitting an issue. If you
would like to <i>implement</i> a new feature, please outline a proposal in your
issue so your fellow collaborators can discuss its possible utility. (No one
wants to do work that won't be appreciated!) Good proposals might discuss:

* The problem being addressed
* Your rationale why its important
* A proposed solution
* Any context surrounding the issue
* Any pros and/or cons

## <a name="code"></a> Code Guidelines

After following the instructions from the README on getting started you can
contribute like a pro by:

* <b>Working on a 
  [proper branch](http://nvie.com/posts/a-successful-git-branching-model/)</b>
    * For example a new feature would be at home on 
      ```git checkout -b feature/my-new-feature```
* <b>Writing Good Commits</b>
    * Generally, the first line is a short overview of your change followed by a
      blank line, then a longer explanation of changes, and finally, any 
      [closing tags](https://help.github.com/articles/closing-issues-via-commit-messages/)
      separated by a blank line if appropriate. For example:
      ```
      implemented separate login pages

      split up the single login page into a dedicated facilitator login page and
      a dedicated participant login page. Added a button linking to each in
      landing.html

      closes #XX
      ```
* <b>Following the [Angular Style Guide](https://angular.io/styleguide)</b>
* <b>Ensuring your contributions are tested</b>
    * You can write your own tests in ```/test``` or run existing tests with
      ```npm test```

## <a name="submissions"></a> Contribution Submissions

After carrying out your new addition to the project which follows the 
[code guidelines](#code) a smooth submission flow should follow under the pull
request process. For a full explanation of this process, check out
[the video tutorial](https://www.youtube.com/watch?v=HW0RPaJqm4g) or
[the official documentation](https://help.github.com/articles/reviewing-changes-in-pull-requests/).
