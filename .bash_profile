# Configuring Our Prompt
# ======================

  # if you install git via homebrew, or install the bash autocompletion via homebrew, you get __git_ps1 which you can use in the PS1
  # to display the git branch.  it's supposedly a bit faster and cleaner than manually parsing through sed. i dont' know if you care
  # enough to change it

  # This function is called in your prompt to output your active git branch.
  function parse_git_branch {
    git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
  }
  #eval "$(direnv hook bash)"
  # This function builds your prompt. It is called below
  function prompt {
    # Define the prompt character
    local   CHAR="♥"

    # Define some local colors
    local   RED="\[\e[0;31m\]"
    local   BLUE="\[\e[0;34m\]"
    local   GREEN="\[\e[0;32m\]"
    local   GRAY_TEXT_BLUE_BACKGROUND="\[\e[37;44;1m\]"

    # Define a variable to reset the text color
    local   RESET="\[\e[0m\]"

    # ♥ ☆ - Keeping some cool ASCII Characters for reference

    # Here is where we actually export the PS1 Variable which stores the text for your prompt
    export PS1="\[\e]2;\u@\h\a[$GRAY_TEXT_BLUE_BACKGROUND\t$RESET]$RED\$(parse_git_branch) $GREEN\W\n$BLUE//$RED $CHAR $RESET"
      PS2='> '
      PS4='+ '
    }

  # Finally call the function and our prompt is all pretty
  prompt

  # For more prompt coolness, check out Halloween Bash:
  # http://xta.github.io/HalloweenBash/

  # If you break your prompt, just delete the last thing you did.
  # And that's why it's good to keep your dotfiles in git too.

  # A handy function to open your bash profile from any directory
  function bp {
    $EDITOR ~/.bash_profile
  }

  rt() {
    rails test $1 -n /$2/

  }

  function rake_test_file()
  {
    bundle exec rake test TEST=$1 TESTOPTS="--name=\"/$2/\""
  }
# Environment Variables
# =====================
  # Library Paths
  # These variables tell your shell where they can find certain
  # required libraries so other programs can reliably call the variable name
  # instead of a hardcoded path.

    # NODE_PATH
    # Node Path from Homebrew I believe
    export NODE_PATH="/usr/local/lib/node_modules:$NODE_PATH"

    # Those NODE & Python Paths won't break anything even if you
    # don't have NODE or Python installed. Eventually you will and
    # then you don't have to update your bash_profile

  # Configurations

    # GIT_MERGE_AUTO_EDIT
    # This variable configures git to not require a message when you merge.
    export GIT_MERGE_AUTOEDIT='no'

    # Editors
    # Tells your shell that when a program requires various editors, use sublime.
    # The -w flag tells your shell to wait until sublime exits
    export VISUAL="vim"
    export SVN_EDITOR="vim"
    export GIT_EDITOR="vim"
    export EDITOR="vim"

    # Version
    # What version of the Flatiron School bash profile this is
    export FLATIRON_VERSION='1.1.1'
  # Paths

    # The USR_PATHS variable will just store all relevant /usr paths for easier usage
    # Each path is seperate via a : and we always use absolute paths.

    # A bit about the /usr directory
    # The /usr directory is a convention from linux that creates a common place to put
    # files and executables that the entire system needs access too. It tries to be user
    # independent, so whichever user is logged in should have permissions to the /usr directory.
    # We call that /usr/local. Within /usr/local, there is a bin directory for actually
    # storing the binaries (programs) that our system would want.
    # Also, Homebrew adopts this convetion so things installed via Homebrew
    # get symlinked into /usr/local
    export USR_PATHS="/usr/local:/usr/local/bin:/usr/local/sbin:/usr/bin"

    # Hint: You can interpolate a variable into a string by using the $VARIABLE notation as below.

    # We build our final PATH by combining the variables defined above
    # along with any previous values in the PATH variable.

    # Our PATH variable is special and very important. Whenever we type a command into our shell,
    # it will try to find that command within a directory that is defined in our PATH.
    # Read http://blog.seldomatt.com/blog/2012/10/08/bash-and-the-one-true-path/ for more on that.
    export PATH="$USR_PATHS:$PATH"

    # If you go into your shell and type: echo $PATH you will see the output of your current path.
    # For example, mine is:
    # /Users/avi/.rvm/gems/ruby-1.9.3-p392/bin:/Users/avi/.rvm/gems/ruby-1.9.3-p392@global/bin:/Users/avi/.rvm/rubies/ruby-1.9.3-p392/bin:/Users/avi/.rvm/bin:/usr/local:/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/local/mysql/bin:/usr/local/share/python:/bin:/usr/sbin:/sbin:

# Helpful Functions
# =====================

# Function to delete all local git branches except for master and those specified
branchCleanup() {
  local currentBranch
  currentBranch="$(git branch | grep ^* | tr -d "*" | tr -d " ")"

  local branchesToKeep
  # Split on whitespace and convert to array
  branchesToKeep=(${currentBranch} ${@})
  echo "Branches to keep:"
  for branch in "${branchesToKeep[@]}"
  do
    if [[ "${branch}" == "${currentBranch}" ]]; then
      echo "  ${branch} (current)"
    else
      echo "  ${branch}"
    fi
  done

  local cmd
  cmd="git branch | grep -v ^*"

  for arg in "${@}"
  do
    cmd="${cmd} | grep -v ${arg}"
  done

  local branchesToDelete
  branchesToDelete=$(eval $cmd)
  if [[ -z "${branchesToDelete}" ]]; then
    echo "There are no branches to delete..."
    return
  else
    echo -e "Branches to delete:\n${branchesToDelete}"
  fi

  cmd="${cmd} | xargs git branch -D"
  echo -e "Command to run:\n  ${cmd}"

  echo "Do you want to run this command? (enter a number)"
  select yn in "Yes" "No"; do
    case $yn in
      Yes )
        eval ${cmd}
        break
        ;;
      No )
        break
        ;;
    esac
  done
}

# A function to CD into the desktop from anywhere
# so you just type desktop.
# HINT: It uses the built in USER variable to know your OS X username

# USE: desktop
#      desktop subfolder
function desktop {
  cd /Users/$USER/Desktop/$@
}

# A function to easily grep for a matching process
# USE: psg postgres
function psg {
  FIRST=`echo $1 | sed -e 's/^\(.\).*/\1/'`
  REST=`echo $1 | sed -e 's/^.\(.*\)/\1/'`
  ps aux | grep "[$FIRST]$REST"
}

# A function to extract correctly any archive based on extension
# USE: extract imazip.zip
#      extract imatar.tar
function extract () {
    if [ -f $1 ] ; then
        case $1 in
            *.tar.bz2)  tar xjf $1      ;;
            *.tar.gz)   tar xzf $1      ;;
            *.bz2)      bunzip2 $1      ;;
            *.rar)      rar x $1        ;;
            *.gz)       gunzip $1       ;;
            *.tar)      tar xf $1       ;;
            *.tbz2)     tar xjf $1      ;;
            *.tgz)      tar xzf $1      ;;
            *.zip)      unzip $1        ;;
            *.Z)        uncompress $1   ;;
            *)          echo "'$1' cannot be extracted via extract()" ;;
        esac
    else
        echo "'$1' is not a valid file"
    fi
}

# Aliases
# =====================
  # LS
  alias l='ls -lah'

  # Git
  alias gcl="git clone"
  alias gst="git status"
  alias gl="git pull"
  alias gp="git push"
  alias gd="git diff | subl"
  alias gc="git commit -v"
  alias gca="git commit -v -a"
  alias gb="git branch"
  alias gba="git branch -a"
  alias gcam="git commit -am"
  alias gbb="git branch -b"
  alias glog="git log --graph --pretty=format:'%Cred%h%Creset %an: %s - %Creset %C(yellow)%d%Creset %Cgreen(%cr)%Creset' --abbrev-commit --date=relative"
  alias fbd="firebase deploy --token 1/tlfFGtovr39Rn3Ir9qAeVsrWqGqW4EeZ_PW680ldMz0"

  alias ksr="cd ~/dev/kickstarter"
  alias vimconfig="vim ~/.vimrc"
  alias restart='touch ./tmp/restart.txt; echo Restarting KSR app...'
# Case-Insensitive Auto Completion
  bind "set completion-ignore-case on"

  # To bash profile
  alias bash_profile="vim ~/.bash_profile"

  # to rails console locally
  alias console="bin/rails c"

  # to ssh to KSR staging
  alias staging="cap staging ssh"
# Postgres
export PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH

# Final Configurations and Plugins
# =====================
  # Git Bash Completion
  # Will activate bash git completion if installed
  # via homebrew
  if [ -f `brew --prefix`/etc/bash_completion ]; then
    . `brew --prefix`/etc/bash_completion
  fi

  if [ -f "$(brew --prefix)/opt/bash-git-prompt/share/gitprompt.sh" ]; then
  __GIT_PROMPT_DIR=$(brew --prefix)/opt/bash-git-prompt/share
  source "$(brew --prefix)/opt/bash-git-prompt/share/gitprompt.sh"
  fi

  # RVM
  # Mandatory loading of RVM into the shell
  # This must be the last line of your bash_profile always
  [[ -s "/Users/$USER/.rvm/scripts/rvm" ]] && source "/Users/$USER/.rvm/scripts/rvm"  # This loads RVM into a shell session.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

##
# Your previous /Users/maloriecasimir/.bash_profile file was backed up as /Users/maloriecasimir/.bash_profile.macports-saved_2018-06-19_at_12:50:53
##

# MacPorts Installer addition on 2018-06-19_at_12:50:53: adding an appropriate PATH variable for use with MacPorts.
export PATH="/opt/local/bin:/opt/local/sbin:$PATH"
# Finished adapting your PATH environment variable for use with MacPorts.

test -e "${HOME}/.iterm2_shell_integration.bash" && source "${HOME}/.iterm2_shell_integration.bash"
export GPG_TTY=$(tty)


export PATH="$HOME/.cargo/bin:$PATH"
source ~/.bashrc # Provisioned by ksr laptop script
